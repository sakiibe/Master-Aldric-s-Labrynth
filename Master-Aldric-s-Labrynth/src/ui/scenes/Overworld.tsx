import { useEffect, useState } from 'react';
import type { BuiltWorkflow, JobAidId, WorkflowId } from '../../game/types';
import { useTheme } from '../../state/useTheme';

/**
 * The Overworld — one continuous night map. Four districts (job aids), each
 * a house with a curved trail of waystones (one per workflow). Districts are
 * always open; a trail gates sequentially via each workflow's `requires`
 * chain, so `done` (how many of a district's workflows are in `completed`)
 * is all the state this scene needs — everything else derives from it.
 *
 * Ported pixel-for-pixel from the overworld design handoff, substituting
 * real workflow data for the mock's hardcoded title lists. Colors not in
 * `theme.ts` (window glow, lamp warmth, ground/sky gradients, plaque tints)
 * are scene-only shades — the handoff calls these out explicitly as
 * intentionally local, not tokens to promote.
 */

interface OverworldProps {
	workflows: BuiltWorkflow[];
	completed: WorkflowId[];
	onSelect: (id: WorkflowId) => void;
}

const STAGE_W = 1920;
const STAGE_H = 1080;
const STAR_COUNT = 170;

/* ------------------------------------------------------------------ */
/* Geometry — deterministic RNG, Catmull-Rom spline, serpentine layout */
/* ------------------------------------------------------------------ */

function rng(seed: number): () => number {
	let s = seed;
	return () => {
		s |= 0;
		s = (s + 0x6d2b79f5) | 0;
		let t = Math.imul(s ^ (s >>> 15), 1 | s);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

interface Pt {
	x: number;
	y: number;
}

/** Catmull-Rom through `pts`, converted to cubic béziers. */
function crPath(pts: Pt[]): string {
	if (pts.length < 2) return '';
	let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] ?? pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] ?? p2;
		const c1x = p1.x + (p2.x - p0.x) / 6;
		const c1y = p1.y + (p2.y - p0.y) / 6;
		const c2x = p2.x - (p3.x - p1.x) / 6;
		const c2y = p2.y - (p3.y - p1.y) / 6;
		d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
	}
	return d;
}

interface DistrictLayout {
	key: JobAidId;
	door: Pt;
	x0: number;
	y0: number;
	w: number;
	h: number;
	rows: number;
	plaque: { x: number; y: number; side: 'left' | 'right' };
	seed: number;
}

/** Trail geometry, in the 1920×1080 design space. Negative `w` means the
 * serpentine runs right-to-left (the two right-hand districts walk their
 * trails inward). Coordinates are the design handoff's, verbatim. */
const LAYOUT: DistrictLayout[] = [
	{
		key: 'bpmh',
		door: { x: 300, y: 340 },
		x0: 430,
		y0: 392,
		w: 170,
		h: 0,
		rows: 1,
		plaque: { x: 470, y: 288, side: 'right' },
		seed: 1000,
	},
	{
		key: 'oncology',
		door: { x: 1660, y: 340 },
		x0: 1618,
		y0: 404,
		w: -410,
		h: 150,
		rows: 3,
		plaque: { x: 1136, y: 626, side: 'right' },
		seed: 1077,
	},
	{
		key: 'cpoe',
		door: { x: 300, y: 802 },
		x0: 404,
		y0: 686,
		w: 376,
		h: 200,
		rows: 3,
		plaque: { x: 832, y: 972, side: 'left' },
		seed: 1154,
	},
	{
		key: 'verification',
		door: { x: 1650, y: 822 },
		x0: 1596,
		y0: 642,
		w: -436,
		h: 264,
		rows: 4,
		plaque: { x: 1120, y: 976, side: 'right' },
		seed: 1231,
	},
];

const READOUT_POS: Record<JobAidId, { left: number; top: number }> = {
	bpmh: { left: 288, top: 276 },
	cpoe: { left: 288, top: 738 },
	oncology: { left: 1500, top: 276 },
	verification: { left: 1500, top: 758 },
};

const PLAQUE_TINT: Record<JobAidId, string> = {
	bpmh: '#7fb3d0',
	verification: '#b39ada',
	cpoe: '#79c4b5',
	oncology: '#d6ac74',
};

interface HouseCfg {
	x: number;
	y: number;
	flip: boolean;
	smokeDelay: string;
	nameLines: string[];
	nameY: number[];
}

const HOUSES: Record<JobAidId, HouseCfg> = {
	bpmh: {
		x: 250,
		y: 330,
		flip: false,
		smokeDelay: '7s',
		nameLines: ['BPMH &', 'MED REC'],
		nameY: [-92, -77],
	},
	oncology: {
		x: 1690,
		y: 330,
		flip: true,
		smokeDelay: '8.5s',
		nameLines: ['ONCOLOGY', 'ORDERS'],
		nameY: [-92, -77],
	},
	cpoe: {
		x: 250,
		y: 792,
		flip: false,
		smokeDelay: '7.8s',
		nameLines: ['CPOE'],
		nameY: [-84],
	},
	verification: {
		x: 1690,
		y: 812,
		flip: true,
		smokeDelay: '9s',
		nameLines: ['PHARMACIST', 'VERIFICATION'],
		nameY: [-92, -77],
	},
};

type NodeState = 'sealed' | 'cleared' | 'current';

interface NodeInfo {
	key: string;
	workflowId: WorkflowId;
	title: string;
	i: number;
	x: number;
	y: number;
	state: NodeState;
	stone: string;
	edge: string;
	edgeW: number;
	rune: string;
	num: string;
	halo: number;
	lantern: number;
	currentOn: number;
}

interface PlaqueInfo {
	key: JobAidId;
	x: number;
	y: number;
	leader: string;
	frame: string;
	boxLeft: number;
	boxTop: number;
	boxWidth: number;
	tint: string;
	kicker: string;
	label: string;
}

/* ------------------------------------------------------------------ */

export function Overworld({ workflows, completed, onSelect }: OverworldProps) {
	const theme = useTheme();
	const [scale, setScale] = useState(1);

	useEffect(() => {
		const fit = () =>
			setScale(
				Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H),
			);
		fit();
		window.addEventListener('resize', fit);
		return () => window.removeEventListener('resize', fit);
	}, []);

	const byDistrict = new Map<JobAidId, BuiltWorkflow[]>();
	for (const w of workflows) {
		const list = byDistrict.get(w.jobAid) ?? [];
		list.push(w);
		byDistrict.set(w.jobAid, list);
	}

	const stars = (() => {
		const r = rng(20260901);
		const out: {
			x: number;
			y: number;
			r: number;
			twinkle: boolean;
			dur: number;
			delay: number;
			opacity: number;
		}[] = [];
		for (let i = 0; i < STAR_COUNT; i++) {
			const y = Math.pow(r(), 1.7) * 300;
			const size = r();
			const twinkle = r() < 0.3;
			out.push({
				x: +(r() * STAGE_W).toFixed(1),
				y: +y.toFixed(1),
				r: +(0.6 + size * 1.9).toFixed(2),
				twinkle,
				dur: +(2.4 + r() * 4).toFixed(1),
				delay: +(r() * 5).toFixed(1),
				opacity: twinkle ? 0.9 : +(0.18 + size * 0.5).toFixed(2),
			});
		}
		return out;
	})();

	const nodes: NodeInfo[] = [];
	const trails: { key: JobAidId; color: string; d: string; lit: string }[] = [];
	const plaques: PlaqueInfo[] = [];
	let totalDone = 0;
	let totalAll = 0;

	LAYOUT.forEach((L) => {
		const list = byDistrict.get(L.key) ?? [];
		const n = list.length;
		const color = theme.jobAids[L.key].color;
		const done = Math.min(
			list.filter((w) => completed.includes(w.id)).length,
			n,
		);
		totalDone += done;
		totalAll += n;

		const cols = Math.ceil(n / L.rows);
		const jit = rng(L.seed);
		const pts: Pt[] = [L.door];
		for (let i = 0; i < n; i++) {
			const row = Math.floor(i / cols);
			let col = i % cols;
			if (row % 2 === 1) col = cols - 1 - col;
			const fx = cols > 1 ? col / (cols - 1) : 0.5;
			const fy = L.rows > 1 ? row / (L.rows - 1) : 0;
			const x = L.x0 + L.w * fx + (jit() - 0.5) * 22;
			const y = L.y0 + L.h * fy + (jit() - 0.5) * 26;
			pts.push({ x, y });
		}
		trails.push({
			key: L.key,
			color,
			d: crPath(pts),
			lit: crPath(pts.slice(0, done + 1)),
		});

		for (let i = 0; i < n; i++) {
			const p = pts[i + 1];
			const state: NodeState =
				i < done ? 'cleared' : i === done ? 'current' : 'sealed';
			nodes.push({
				key: `${L.key}${i}`,
				workflowId: list[i].id,
				title: list[i].title,
				i: i + 1,
				x: +p.x.toFixed(1),
				y: +p.y.toFixed(1),
				state,
				stone:
					state === 'sealed'
						? '#241a42'
						: state === 'current'
							? color
							: color + '66',
				edge:
					state === 'sealed'
						? '#4a3d63'
						: state === 'current'
							? '#caa14a'
							: color,
				edgeW: state === 'current' ? 2.6 : 1.6,
				rune: state === 'sealed' ? '#4a3d63' : '#f4ead6',
				num:
					state === 'sealed'
						? '#4a3d63'
						: state === 'current'
							? '#f4ead6'
							: '#c9b8e8',
				halo: state === 'current' ? 0.85 : state === 'cleared' ? 0.22 : 0,
				lantern: state === 'cleared' ? 1 : 0,
				currentOn: state === 'current' ? 1 : 0,
			});
		}

		if (done < n) {
			const cur = pts[done + 1];
			const right = L.plaque.side === 'right';
			const w = 300;
			const px = L.plaque.x;
			const py = L.plaque.y;
			plaques.push({
				key: L.key,
				x: px,
				y: py,
				leader: `M${(cur.x - px).toFixed(1)},${(cur.y - py).toFixed(1)} L${right ? 4 : -4},0`,
				frame: right
					? `M0,-32 L${w},-32 L${w},42 L0,42 Z`
					: `M${-w},-32 L0,-32 L0,42 L${-w},42 Z`,
				boxLeft: right ? px + 18 : px - w + 18,
				boxTop: py - 26,
				boxWidth: w - 36,
				tint: PLAQUE_TINT[L.key],
				kicker: `NEXT · ${done + 1} OF ${n}`,
				label: list[done].title,
			});
		}
	});

	// Ordinal digits hide where a plaque sits on top of them.
	const plaqueRects = plaques.map((p) => {
		const right = p.frame.startsWith('M0,');
		return right
			? { x1: p.x - 6, x2: p.x + 306, y1: p.y - 38, y2: p.y + 48 }
			: { x1: p.x - 306, x2: p.x + 6, y1: p.y - 38, y2: p.y + 48 };
	});
	const hidden = new Set(
		nodes
			.filter((n) =>
				plaqueRects.some(
					(r) => n.x > r.x1 && n.x < r.x2 && n.y > r.y1 && n.y < r.y2,
				),
			)
			.map((n) => n.key),
	);

	return (
		<div
			style={{
				width: '100vw',
				height: '100vh',
				background: '#1b1230',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			<style>{`
        @keyframes ow-tw { 0%, 100% { opacity: .25 } 50% { opacity: 1 } }
        @keyframes ow-drift { 0% { transform: translate(0,0) } 100% { transform: translate(28px,-34px) } }
        @keyframes ow-pulse { 0%, 100% { opacity: .28 } 50% { opacity: .62 } }
        .ow-node[data-clickable="true"] { cursor: pointer; }
        .ow-node[data-clickable="true"]:hover .ow-node-halo { opacity: .95; }
        .ow-node:focus-visible { outline: 2px solid #caa14a; outline-offset: 4px; border-radius: 50%; }
        @media (prefers-reduced-motion: no-preference) {
          .ow-twinkle { animation: ow-tw var(--dur) ease-in-out var(--delay) infinite; }
          .ow-smoke { animation: ow-drift 7s ease-out infinite; }
          .ow-pulse-ring { animation: ow-pulse 2.6s ease-in-out infinite; }
        }
      `}</style>
			<div
				style={{
					position: 'relative',
					width: STAGE_W,
					height: STAGE_H,
					flex: 'none',
					transform: `scale(${scale})`,
					transformOrigin: 'center center',
				}}
			>
				<svg
					viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
					width={STAGE_W}
					height={STAGE_H}
					style={{ position: 'absolute', inset: 0, display: 'block' }}
				>
					<defs>
						<radialGradient id="ow-sky" cx="0.78" cy="0.06" r="0.95">
							<stop offset="0" stopColor="#33235c" />
							<stop offset="0.45" stopColor="#241a44" />
							<stop offset="1" stopColor="#160f28" />
						</radialGradient>
						<linearGradient id="ow-ground" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#241a42" />
							<stop offset="0.55" stopColor="#1d1435" />
							<stop offset="1" stopColor="#170f2a" />
						</linearGradient>
						<radialGradient id="ow-moonhalo" cx="0.5" cy="0.5" r="0.5">
							<stop offset="0" stopColor="#f4ead6" stopOpacity="0.42" />
							<stop offset="0.35" stopColor="#c9b8e8" stopOpacity="0.16" />
							<stop offset="1" stopColor="#c9b8e8" stopOpacity="0" />
						</radialGradient>
						<radialGradient id="ow-lamp" cx="0.5" cy="0.5" r="0.5">
							<stop offset="0" stopColor="#ffd79a" stopOpacity="0.75" />
							<stop offset="1" stopColor="#ffd79a" stopOpacity="0" />
						</radialGradient>
						<linearGradient id="ow-mist" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#c9b8e8" stopOpacity="0" />
							<stop offset="0.5" stopColor="#c9b8e8" stopOpacity="0.13" />
							<stop offset="1" stopColor="#c9b8e8" stopOpacity="0" />
						</linearGradient>
						<filter id="ow-glow" x="-120%" y="-120%" width="340%" height="340%">
							<feGaussianBlur stdDeviation="6" result="b" />
							<feMerge>
								<feMergeNode in="b" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>
						<filter
							id="ow-softblur"
							x="-60%"
							y="-60%"
							width="220%"
							height="220%"
						>
							<feGaussianBlur stdDeviation="9" />
						</filter>
					</defs>

					<rect
						x="0"
						y="0"
						width={STAGE_W}
						height={STAGE_H}
						fill="url(#ow-sky)"
					/>

					{stars.map((s, i) => (
						<circle
							key={i}
							cx={s.x}
							cy={s.y}
							r={s.r}
							fill="#f4ead6"
							className={s.twinkle ? 'ow-twinkle' : undefined}
							opacity={s.twinkle ? undefined : s.opacity}
							style={
								s.twinkle
									? ({
											'--dur': `${s.dur}s`,
											'--delay': `${s.delay}s`,
											opacity: 0.9,
										} as React.CSSProperties)
									: undefined
							}
						/>
					))}

					{/* moon — the map's only cool light source */}
					<g>
						<circle cx="1568" cy="150" r="190" fill="url(#ow-moonhalo)" />
						<circle cx="1568" cy="150" r="62" fill="#f4ead6" />
						<circle cx="1568" cy="150" r="62" fill="#e6dcc6" opacity="0.5" />
						<circle cx="1549" cy="134" r="11" fill="#d8ccb2" opacity="0.75" />
						<circle cx="1585" cy="166" r="7.5" fill="#d8ccb2" opacity="0.6" />
						<circle cx="1560" cy="176" r="5" fill="#d8ccb2" opacity="0.5" />
					</g>

					{/* hedge-maze horizon */}
					<path
						d="M0,268 L0,214 L46,214 L46,190 L92,190 L92,222 L150,222 L150,196 L214,196 L214,228 L268,228 L268,202 L332,202 L332,232 L392,232 L392,198 L452,198 L452,226 L520,226 L520,204 L586,204 L586,234 L648,234 L648,206 L716,206 L716,230 L782,230 L782,200 L850,200 L850,228 L918,228 L918,208 L988,208 L988,232 L1054,232 L1054,198 L1122,198 L1122,226 L1190,226 L1190,204 L1258,204 L1258,230 L1324,230 L1324,200 L1392,200 L1392,228 L1460,228 L1460,206 L1528,206 L1528,232 L1596,232 L1596,202 L1664,202 L1664,228 L1732,228 L1732,198 L1800,198 L1800,226 L1866,226 L1866,208 L1920,208 L1920,268 Z"
						fill="#160f28"
						opacity="0.92"
					/>
					<path
						d="M0,272 L0,238 L1920,238 L1920,272 Z"
						fill="#160f28"
						opacity="0.6"
					/>

					<rect
						x="0"
						y="248"
						width={STAGE_W}
						height="832"
						fill="url(#ow-ground)"
					/>
					<ellipse cx="960" cy="262" rx="1180" ry="52" fill="url(#ow-mist)" />
					<ellipse
						cx="520"
						cy="286"
						rx="620"
						ry="34"
						fill="url(#ow-mist)"
						opacity="0.7"
					/>
					<g opacity="0.5">
						<ellipse
							cx="960"
							cy="1006"
							rx="1100"
							ry="86"
							fill="url(#ow-mist)"
						/>
						<ellipse cx="420" cy="1042" rx="640" ry="60" fill="url(#ow-mist)" />
						<ellipse
							cx="1480"
							cy="1050"
							rx="600"
							ry="54"
							fill="url(#ow-mist)"
						/>
					</g>

					{/* Aldric's tower — non-interactive anchor */}
					<g>
						<circle
							cx="960"
							cy="352"
							r="176"
							fill="url(#ow-lamp)"
							opacity="0.5"
						/>
						<ellipse
							cx="960"
							cy="574"
							rx="118"
							ry="26"
							fill="#120c22"
							opacity="0.7"
						/>
						<path
							d="M898,566 L906,352 L1014,352 L1022,566 Z"
							fill="#2a1d47"
							stroke="#4a3d63"
							strokeWidth="2"
						/>
						<path d="M906,352 L1014,352 L1014,340 L906,340 Z" fill="#372753" />
						<path
							d="M890,340 L1030,340 L1022,318 L898,318 Z"
							fill="#372753"
							stroke="#4a3d63"
							strokeWidth="1.5"
						/>
						<path
							d="M898,318 L960,232 L1022,318 Z"
							fill="#241a42"
							stroke="#4a3d63"
							strokeWidth="2"
						/>
						<path d="M960,232 L960,206" stroke="#caa14a" strokeWidth="3" />
						<circle cx="960" cy="200" r="6" fill="#caa14a" />
						<path
							d="M938,382 L982,382 L982,428 Q960,444 938,428 Z"
							fill="#ffcf8f"
							opacity="0.9"
							filter="url(#ow-glow)"
						/>
						<path
							d="M926,470 L994,470 L994,516 L926,516 Z"
							fill="#caa14a"
							opacity="0.22"
						/>
						<path
							d="M940,528 L980,528 L980,566 L940,566 Z"
							fill="#160f28"
							stroke="#4a3d63"
							strokeWidth="1.5"
						/>
						<text
							x="960"
							y="622"
							textAnchor="middle"
							fontFamily="Cinzel, serif"
							fontSize="21"
							letterSpacing="4"
							fill="#caa14a"
						>
							ALDRIC&apos;S TOWER
						</text>
						<text
							x="960"
							y="648"
							textAnchor="middle"
							fontFamily="Spectral, serif"
							fontSize="16"
							letterSpacing="1.5"
							fill="#7d6bab"
							fontStyle="italic"
						>
							the master is in
						</text>
					</g>

					{trails.map((t) => (
						<g key={t.key}>
							<path
								d={t.d}
								fill="none"
								stroke="#120c22"
								strokeWidth="16"
								strokeLinecap="round"
								opacity="0.55"
							/>
							<path
								d={t.d}
								fill="none"
								stroke="#372753"
								strokeWidth="9"
								strokeLinecap="round"
							/>
							<path
								d={t.d}
								fill="none"
								stroke="#4a3d63"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeDasharray="3 13"
								opacity="0.8"
							/>
							<path
								d={t.lit}
								fill="none"
								stroke={t.color}
								strokeWidth="13"
								strokeLinecap="round"
								opacity="0.28"
								filter="url(#ow-softblur)"
							/>
							<path
								d={t.lit}
								fill="none"
								stroke={t.color}
								strokeWidth="8.5"
								strokeLinecap="round"
							/>
							<path
								d={t.lit}
								fill="none"
								stroke="#f4ead6"
								strokeWidth="2.2"
								strokeLinecap="round"
								strokeDasharray="2 11"
								opacity="0.55"
							/>
						</g>
					))}

					{nodes.map((n) => (
						<g
							key={n.key}
							className="ow-node"
							data-clickable={n.state !== 'sealed'}
							transform={`translate(${n.x} ${n.y})`}
							role={n.state !== 'sealed' ? 'button' : undefined}
							tabIndex={n.state !== 'sealed' ? 0 : undefined}
							aria-label={
								n.state !== 'sealed' ? `${n.title} — ${n.state}` : undefined
							}
							aria-disabled={n.state === 'sealed'}
							onClick={
								n.state !== 'sealed' ? () => onSelect(n.workflowId) : undefined
							}
							onKeyDown={
								n.state !== 'sealed'
									? (e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault();
												onSelect(n.workflowId);
											}
										}
									: undefined
							}
						>
							<circle
								className="ow-node-halo"
								cx="0"
								cy="-6"
								r="46"
								fill="url(#ow-lamp)"
								opacity={n.halo}
							/>
							<ellipse
								cx="0"
								cy="11"
								rx="17"
								ry="5.5"
								fill="#120c22"
								opacity="0.6"
							/>
							<path
								d="M-11,10 L-10,-9 Q0,-20 10,-9 L11,10 Z"
								fill={n.stone}
								stroke={n.edge}
								strokeWidth={n.edgeW}
							/>
							<path
								d="M-6,-4 L6,-4"
								stroke={n.rune}
								strokeWidth="1.4"
								opacity="0.5"
							/>
							<g opacity={n.lantern}>
								<path
									d="M0,-20 L0,-30 L13,-30"
									stroke="#caa14a"
									strokeWidth="1.6"
									fill="none"
								/>
								<path d="M13,-30 L13,-25" stroke="#caa14a" strokeWidth="1.4" />
								<path
									d="M9,-25 L17,-25 L18,-15 L8,-15 Z"
									fill="#3a2a1a"
									stroke="#caa14a"
									strokeWidth="1.2"
								/>
								<circle
									cx="13"
									cy="-20"
									r="3.4"
									fill="#ffd79a"
									filter="url(#ow-glow)"
								/>
							</g>
							<g opacity={n.currentOn}>
								<circle
									className="ow-pulse-ring"
									cx="0"
									cy="-2"
									r="26"
									fill="none"
									stroke="#caa14a"
									strokeWidth="1.6"
								/>
								<path d="M0,-22 L0,-44" stroke="#caa14a" strokeWidth="2" />
								<path
									d="M-7,-44 L7,-44 L9,-30 L-9,-30 Z"
									fill="#4a3520"
									stroke="#caa14a"
									strokeWidth="1.6"
								/>
								<circle
									cx="0"
									cy="-37"
									r="5"
									fill="#ffd79a"
									filter="url(#ow-glow)"
								/>
							</g>
						</g>
					))}

					{plaques.map((p) => (
						<g key={p.key} transform={`translate(${p.x} ${p.y})`}>
							<path
								d={p.leader}
								fill="none"
								stroke="#caa14a"
								strokeWidth="1.2"
								strokeDasharray="4 6"
								opacity="0.55"
							/>
							<path
								d={p.frame}
								fill="#1b1230"
								stroke="#caa14a"
								strokeWidth="1.4"
								opacity="0.96"
							/>
						</g>
					))}

					{(['bpmh', 'oncology', 'cpoe', 'verification'] as JobAidId[]).map(
						(key) => (
							<DistrictHouse
								key={key}
								district={key}
								cfg={HOUSES[key]}
								color={theme.jobAids[key].color}
							/>
						),
					)}

					{/* HUD — wordmark, top-left */}
					<g transform="translate(56 60)">
						<path
							d="M0,0 L0,-14 L26,-14"
							stroke="#caa14a"
							strokeWidth="2"
							fill="none"
						/>
						<path
							d="M0,0 L0,50 L26,50"
							stroke="#caa14a"
							strokeWidth="2"
							fill="none"
						/>
						<text
							x="18"
							y="16"
							fontFamily="Cinzel, serif"
							fontSize="19"
							fontWeight="700"
							letterSpacing="4.5"
							fill="#caa14a"
						>
							MASTER ALDRIC&apos;S
						</text>
						<text
							x="18"
							y="40"
							fontFamily="Cinzel, serif"
							fontSize="19"
							fontWeight="700"
							letterSpacing="4.5"
							fill="#f4ead6"
						>
							LABYRINTH
						</text>
					</g>

					{/* HUD — total, top-right */}
					<g transform="translate(1864 60)">
						<path
							d="M0,0 L0,-14 L-26,-14"
							stroke="#caa14a"
							strokeWidth="2"
							fill="none"
						/>
						<path
							d="M0,0 L0,50 L-26,50"
							stroke="#caa14a"
							strokeWidth="2"
							fill="none"
						/>
						<text
							x="-18"
							y="12"
							textAnchor="end"
							fontFamily="Cinzel, serif"
							fontSize="13"
							letterSpacing="3"
							fill="#7d6bab"
						>
							WORKFLOWS LEARNED
						</text>
					</g>
				</svg>

				{/* HTML overlay: crisp text laid over the scaled SVG stage */}
				<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
					{nodes
						.filter((n) => !hidden.has(n.key))
						.map((n) => (
							<div
								key={n.key}
								style={{
									position: 'absolute',
									left: n.x - 18,
									top: n.y - 10,
									width: 36,
									textAlign: 'center',
									font: '600 13px Cinzel, serif',
									color: n.num,
								}}
							>
								{n.i}
							</div>
						))}

					{plaques.map((p) => (
						<div
							key={p.key}
							style={{
								position: 'absolute',
								left: p.boxLeft,
								top: p.boxTop,
								width: p.boxWidth,
							}}
						>
							<div
								style={{
									font: '500 11px Cinzel, serif',
									letterSpacing: '2.4px',
									color: p.tint,
								}}
							>
								{p.kicker}
							</div>
							<div
								style={{
									font: '400 17px/1.35 Spectral, serif',
									color: '#f4ead6',
									marginTop: 3,
								}}
							>
								{p.label}
							</div>
						</div>
					))}

					{(['bpmh', 'cpoe', 'oncology', 'verification'] as JobAidId[]).map(
						(key) => {
							const list = byDistrict.get(key) ?? [];
							const done = list.filter((w) => completed.includes(w.id)).length;
							const pos = READOUT_POS[key];
							return (
								<div
									key={key}
									style={{
										position: 'absolute',
										left: pos.left,
										top: pos.top,
										width: 152,
										textAlign: 'center',
										whiteSpace: 'nowrap',
										font: '400 15px Spectral, serif',
										color: '#c9b8e8',
									}}
								>
									{done} OF {list.length} LEARNED
								</div>
							);
						},
					)}

					<div
						style={{
							position: 'absolute',
							right: 74,
							top: 78,
							font: '700 24px Cinzel, serif',
							letterSpacing: '2px',
							color: '#caa14a',
						}}
					>
						{totalDone} / {totalAll}
					</div>
				</div>

				{/* Interactive layer: transparent buttons over each waystone, kept
            separate from the label overlay so a hidden ordinal digit (under
            a plaque) is still clickable. */}
				<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
					{nodes.map((n) => (
						<button
							key={n.key}
							type="button"
							disabled={n.state === 'sealed'}
							onClick={() => onSelect(n.workflowId)}
							title={`${n.title} — ${n.state}`}
							aria-label={`${n.title} — ${n.state === 'sealed' ? 'sealed' : n.state === 'current' ? 'current' : 'cleared, replay'}`}
							style={{
								position: 'absolute',
								left: n.x - 24,
								top: n.y - 34,
								width: 48,
								height: 56,
								background: 'none',
								border: 'none',
								padding: 0,
								pointerEvents: n.state === 'sealed' ? 'none' : 'auto',
								cursor: n.state === 'sealed' ? 'default' : 'pointer',
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* House — two shared shells (signpost right / signpost left), differing
   only in stroke color, smoke timing, sigil, and name lines. */
/* ------------------------------------------------------------------ */

function DistrictHouse({
	district,
	cfg,
	color,
}: {
	district: JobAidId;
	cfg: HouseCfg;
	color: string;
}) {
	const sx = cfg.flip ? -1 : 1;
	const sigilX = cfg.flip ? -144 : 84;
	const textX = cfg.flip ? -124 : 104;
	const boardX0 = cfg.flip ? -166 : 62;
	const boardX1 = cfg.flip ? -62 : 166;
	const hairlineX0 = cfg.flip ? -162 : 66;
	const hairlineX1 = cfg.flip ? -66 : 162;
	const postX = 84 * sx;
	const lanternX = -64 * sx;

	return (
		<g transform={`translate(${cfg.x} ${cfg.y})`}>
			<ellipse cx="0" cy="4" rx="86" ry="18" fill="#120c22" opacity="0.6" />
			<circle cx="0" cy="-46" r="150" fill="url(#ow-lamp)" opacity="0.34" />

			{/* body, roof, eave, door, windows — identical across all four houses */}
			<path
				d="M-56,0 L-56,-84 L56,-84 L56,0 Z"
				fill="#2a1d47"
				stroke={color}
				strokeWidth="2"
			/>
			<path
				d="M-72,-84 L0,-136 L72,-84 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="2.5"
			/>
			<path
				d="M-72,-84 L72,-84 L72,-76 L-72,-76 Z"
				fill={color}
				opacity="0.45"
			/>
			<rect
				x="-40"
				y="-64"
				width="26"
				height="24"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<rect
				x="14"
				y="-64"
				width="26"
				height="24"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<path
				d="M-13,0 L-13,-34 Q0,-44 13,-34 L13,0 Z"
				fill="#3a2a1a"
				stroke="#caa14a"
				strokeWidth="1.6"
			/>

			{/* chimney, mirrored by district */}
			<path
				d={`M${30 * sx},-118 L${30 * sx},-146 L${46 * sx},-146 L${46 * sx},-107 Z`}
				fill="#241a42"
				stroke={color}
				strokeWidth="1.6"
			/>
			<g
				fill="#c9b8e8"
				opacity="0.16"
				className="ow-smoke"
				style={{ animationDuration: cfg.smokeDelay }}
			>
				<circle cx={38 * sx} cy="-158" r="7" />
				<circle cx={cfg.flip ? -30 : 46} cy="-176" r="9" />
				<circle cx={cfg.flip ? -40 : 36} cy="-196" r="11" />
			</g>

			{/* lantern post, opposite the signpost */}
			<path
				d={`M${lanternX},-6 L${lanternX},-56`}
				stroke="#4a3d63"
				strokeWidth="3"
			/>
			<path
				d={`M${lanternX - 6},-56 L${lanternX + 6},-56 L${lanternX + 8},-42 L${lanternX - 8},-42 Z`}
				fill="#3a2a1a"
				stroke="#caa14a"
				strokeWidth="1.4"
			/>
			<circle
				cx={lanternX}
				cy="-49"
				r="4.5"
				fill="#ffd79a"
				filter="url(#ow-glow)"
			/>

			{/* signpost */}
			<path d={`M${postX},4 L${postX},-58`} stroke="#4a3d63" strokeWidth="5" />
			<path
				d={`M${boardX0},-116 L${boardX1},-116 L${boardX1},-60 L${boardX0},-60 Z`}
				fill="#1b1230"
				stroke="#caa14a"
				strokeWidth="2"
			/>
			<path
				d={`M${hairlineX0},-112 L${hairlineX1},-112 L${hairlineX1},-64 L${hairlineX0},-64 Z`}
				fill="none"
				stroke="#caa14a"
				strokeWidth="0.8"
				opacity="0.5"
			/>
			<g transform={`translate(${sigilX} -88)`}>
				<DistrictSigil district={district} color={color} />
			</g>
			{cfg.nameLines.map((line, i) => (
				<text
					key={i}
					x={textX}
					y={cfg.nameY[i]}
					fontFamily="Cinzel, serif"
					fontSize="13"
					fontWeight="600"
					letterSpacing="1.6"
					fill="#f4ead6"
				>
					{line}
				</text>
			))}
		</g>
	);
}

function DistrictSigil({
	district,
	color,
}: {
	district: JobAidId;
	color: string;
}) {
	if (district === 'bpmh') {
		// mortar & pestle
		return (
			<g stroke={color} strokeWidth="1.8" fill="none">
				<path d="M-9,-2 A9,9 0 0 0 9,-2 Z" fill={color} opacity="0.5" />
				<path d="M-11,-2 L11,-2" />
				<path d="M2,-6 L10,-16" />
				<path d="M9,10 L-9,10" />
			</g>
		);
	}
	if (district === 'oncology') {
		// alchemical sun
		return (
			<g stroke={color} strokeWidth="1.8" fill="none">
				<circle cx="0" cy="0" r="8" />
				<circle cx="0" cy="0" r="3" fill={color} />
				<path d="M0,-13 L0,-10" />
				<path d="M0,13 L0,10" />
				<path d="M-13,0 L-10,0" />
				<path d="M13,0 L10,0" />
			</g>
		);
	}
	if (district === 'cpoe') {
		// retort / flask
		return (
			<g stroke={color} strokeWidth="1.8" fill="none">
				<path d="M-4,-12 L4,-12" />
				<path d="M-3,-12 L-3,-5 L-8,6 A9,9 0 0 0 8,6 L3,-5 L3,-12" />
				<path d="M-7,3 L7,3" stroke={color} strokeWidth="5" opacity="0.55" />
			</g>
		);
	}
	// verification: funnel on a stand
	return (
		<g stroke={color} strokeWidth="1.8" fill="none">
			<path
				d="M-8,-11 L8,-11 L1,-1 L1,11 L-1,11 L-1,-1 Z"
				fill={color}
				opacity="0.35"
			/>
			<path d="M-8,-11 L8,-11" />
			<path d="M-9,12 L9,12" />
		</g>
	);
}
