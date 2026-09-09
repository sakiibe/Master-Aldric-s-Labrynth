import { useEffect, useState } from 'react';
import type { BuiltWorkflow, JobAidId, WorkflowId } from '../../game/types';
import { useTheme } from '../../state/useTheme';
import { DistrictSigil } from '../art/DistrictSigil';
import { DISTRICT_TINT } from '../art/districtTints';

/**
 * The Overworld — one continuous night map. Four districts (job aids), each
 * a house with a coiling trail of waystones (one per workflow) that runs
 * from the house door into Aldric's Tower at the centre. Districts are
 * always open; a trail gates sequentially via each workflow's `requires`
 * chain, so `done` (how many of a district's workflows are in `completed`)
 * is all the state this scene needs — everything else derives from it.
 *
 * Ported from `design_handoff_overworld/Overworld.dc.html`, substituting
 * real workflow data for the mock's hardcoded title lists. Every trail is
 * a generated quadratic Bézier with a sine switchback offset; waystones
 * ride it at equal ARC LENGTH (equal-t spacing bunches stones wherever the
 * coil turns). Colours not in `theme.ts` — window/lamp warmth, ground and
 * sky gradients, plaque tints, the darker scene shades — are called out in
 * the handoff as intentionally scene-only, not tokens to promote.
 */

interface OverworldProps {
	workflows: BuiltWorkflow[];
	completed: WorkflowId[];
	onSelect: (id: WorkflowId) => void;
	/** Leave the map for the title screen. */
	onExit: () => void;
}

const STAGE_W = 1920;
const STAGE_H = 1080;
const STAR_COUNT = 170;
const STAR_SEED = 20260901;

/* ------------------------------------------------------------------ */
/* Geometry — deterministic RNG, Catmull-Rom spline, switchback layout */
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
	/** House door threshold — the trail's start. */
	door: Pt;
	/** Quadratic Bézier control point. */
	c: Pt;
	/** Terminal point on the tower plinth — the trail's end. */
	end: Pt;
	/** Sample window along the base curve. */
	t0: number;
	t1: number;
	/** Perpendicular switchback amplitude, and lobe count. */
	amp: number;
	waves: number;
	plaque: { x: number; y: number; side: 'left' | 'right' };
}

/** Trail geometry, in the 1920×1080 design space. Verbatim from the
 * handoff — re-tuning any curve means re-measuring the minimum
 * centre-to-centre stone gap and keeping it ≥ 45px (Verification's
 * 20-stone trail is the tightest, at 46.5px with these values). */
const LAYOUT: DistrictLayout[] = [
	{
		key: 'bpmh',
		door: { x: 300, y: 340 },
		c: { x: 600, y: 300 },
		end: { x: 874, y: 552 },
		t0: 0.28,
		t1: 0.85,
		amp: 30,
		waves: 1,
		plaque: { x: 520, y: 205, side: 'right' },
	},
	{
		key: 'oncology',
		door: { x: 1660, y: 340 },
		c: { x: 1400, y: 318 },
		end: { x: 1046, y: 552 },
		t0: 0.09,
		t1: 0.93,
		amp: 48,
		waves: 3,
		plaque: { x: 1400, y: 205, side: 'left' },
	},
	{
		key: 'cpoe',
		door: { x: 300, y: 802 },
		c: { x: 560, y: 952 },
		end: { x: 874, y: 608 },
		t0: 0.09,
		t1: 0.93,
		amp: 54,
		waves: 3,
		plaque: { x: 430, y: 1010, side: 'right' },
	},
	{
		key: 'verification',
		door: { x: 1650, y: 822 },
		c: { x: 1320, y: 1000 },
		end: { x: 1046, y: 608 },
		t0: 0.05,
		t1: 0.96,
		amp: 84,
		waves: 5,
		plaque: { x: 1490, y: 1030, side: 'left' },
	},
];

/** House door threshold — the group origin each building is drawn around. */
const HOUSE_ORIGIN: Record<JobAidId, Pt> = {
	bpmh: { x: 250, y: 330 },
	oncology: { x: 1690, y: 330 },
	cpoe: { x: 250, y: 792 },
	verification: { x: 1690, y: 812 },
};

/** Signpost label, split to fit the 136×82 board. */
const HOUSE_NAME: Record<JobAidId, { lines: string[]; y: number[] }> = {
	bpmh: { lines: ['BPMH &', 'MED REC'], y: [-78, -61] },
	oncology: { lines: ['ONCOLOGY', 'ORDERS'], y: [-78, -61] },
	cpoe: { lines: ['CPOE'], y: [-70] },
	verification: { lines: ['PHARMACIST', 'VERIFICATION'], y: [-78, -61] },
};

const SMOKE_DUR: Record<JobAidId, string> = {
	bpmh: '7s',
	oncology: '8.5s',
	cpoe: '7.8s',
	verification: '9s',
};

type NodeState = 'sealed' | 'cleared' | 'current';

interface NodeInfo {
	key: string;
	dk: JobAidId;
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
	right: boolean;
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

export function Overworld({
	workflows,
	completed,
	onSelect,
	onExit,
}: OverworldProps) {
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
		const r = rng(STAR_SEED);
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

	LAYOUT.forEach((L, li) => {
		const list = byDistrict.get(L.key) ?? [];
		const n = list.length;
		const color = theme.jobAids[L.key].color;
		const done = Math.min(
			list.filter((w) => completed.includes(w.id)).length,
			n,
		);
		totalDone += done;
		totalAll += n;

		const jit = rng(1000 + li * 77);
		const bez = (t: number, a: number, b: number, cc: number) => {
			const u = 1 - t;
			return u * u * a + 2 * u * t * b + t * t * cc;
		};

		// Sample the switchback curve densely, accumulate arc length, then
		// drop waystones at equal arc length along it.
		const SAMP = 800;
		const raw: Pt[] = [];
		const cum: number[] = [0];
		for (let s = 0; s <= SAMP; s++) {
			const tn = s / SAMP;
			const t = L.t0 + (L.t1 - L.t0) * tn;
			const bx = bez(t, L.door.x, L.c.x, L.end.x);
			const by = bez(t, L.door.y, L.c.y, L.end.y);
			const dx = 2 * (1 - t) * (L.c.x - L.door.x) + 2 * t * (L.end.x - L.c.x);
			const dy = 2 * (1 - t) * (L.c.y - L.door.y) + 2 * t * (L.end.y - L.c.y);
			const len = Math.hypot(dx, dy) || 1;
			const a = L.amp * Math.sin(L.waves * Math.PI * tn);
			raw.push({ x: bx - (dy / len) * a, y: by + (dx / len) * a });
			if (s > 0)
				cum.push(
					cum[s - 1] +
						Math.hypot(raw[s].x - raw[s - 1].x, raw[s].y - raw[s - 1].y),
				);
		}
		const total = cum[SAMP];

		const pts: Pt[] = [{ x: L.door.x, y: L.door.y }];
		for (let i = 0; i < n; i++) {
			const target = n > 1 ? (total * i) / (n - 1) : total / 2;
			let s = 1;
			while (s < SAMP && cum[s] < target) s++;
			pts.push({
				x: raw[s].x + (jit() - 0.5) * 10,
				y: raw[s].y + (jit() - 0.5) * 10,
			});
		}
		pts.push({ x: L.end.x, y: L.end.y });

		// The terminal point joins the lit subpath only once the district
		// is cleared — then the trail lights all the way into the tower.
		const litTo = 1 + done + (done === n ? 1 : 0);
		trails.push({
			key: L.key,
			color,
			d: crPath(pts),
			lit: crPath(pts.slice(0, litTo)),
		});

		for (let i = 0; i < n; i++) {
			const p = pts[i + 1];
			const state: NodeState =
				i < done ? 'cleared' : i === done ? 'current' : 'sealed';
			nodes.push({
				key: `${L.key}${i}`,
				dk: L.key,
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
				right,
				leader: `M${(cur.x - px).toFixed(1)},${(cur.y - py).toFixed(1)} L${right ? 4 : -4},0`,
				frame: right
					? `M0,-32 L${w},-32 L${w},42 L0,42 Z`
					: `M${-w},-32 L0,-32 L0,42 L${-w},42 Z`,
				boxLeft: right ? px + 18 : px - w + 18,
				boxTop: py - 26,
				boxWidth: w - 36,
				tint: DISTRICT_TINT[L.key],
				kicker: `NEXT · ${done + 1} OF ${n}`,
				label: list[done].title,
			});
		}
	});

	// A waystone ordinal falling inside its OWN district's plaque rect is
	// hidden so digits don't bleed through. Scoped to the district — an
	// earlier version tested every stone against every plaque and a
	// cross-district overlap silently erased numbers instead of surfacing
	// the layout conflict.
	const plaqueRects = plaques.map((p) => ({
		dk: p.key,
		x1: p.right ? p.x - 6 : p.x - 306,
		x2: p.right ? p.x + 306 : p.x + 6,
		y1: p.y - 38,
		y2: p.y + 48,
	}));
	const hidden = new Set(
		nodes
			.filter((n) =>
				plaqueRects.some(
					(r) =>
						r.dk === n.dk &&
						n.x > r.x1 &&
						n.x < r.x2 &&
						n.y > r.y1 &&
						n.y < r.y2,
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
        .ow-hit { background: none; border: none; padding: 0; }
        .ow-hit:not(:disabled) { cursor: pointer; }
        .ow-hit:focus-visible { outline: 2px solid #caa14a; outline-offset: 4px; border-radius: 50%; }
        .ow-back {
          display: flex; align-items: center; gap: 9px;
          padding: 9px 18px 9px 14px;
          font: 600 12px Cinzel, serif; letter-spacing: 2.4px;
          color: #caa14a; cursor: pointer;
          background: #1b1230cc; border: 1.5px solid #caa14a;
          transition: color 160ms ease, border-color 160ms ease, background 160ms ease;
        }
        .ow-back:hover, .ow-back:focus-visible { color: #f4ead6; background: #241a42; }
        .ow-back:focus-visible { outline: 2px solid #caa14a; outline-offset: 3px; }
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
						<circle cx="1568" cy="108" r="190" fill="url(#ow-moonhalo)" />
						<circle cx="1568" cy="108" r="62" fill="#f4ead6" />
						<circle cx="1568" cy="108" r="62" fill="#e6dcc6" opacity="0.5" />
						<circle cx="1549" cy="92" r="11" fill="#d8ccb2" opacity="0.75" />
						<circle cx="1585" cy="124" r="7.5" fill="#d8ccb2" opacity="0.6" />
						<circle cx="1560" cy="134" r="5" fill="#d8ccb2" opacity="0.5" />
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

					{/* Aldric's tower — non-interactive hub; every trail terminates here */}
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
						{/* caption sits above the spire */}
						<text
							x="960"
							y="152"
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
							y="178"
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
						<g key={n.key} transform={`translate(${n.x} ${n.y})`}>
							<circle
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
							{/* cleared: a lit hanging lantern — doubles as the light
							    that explains why the trail behind it is lit */}
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
							{/* current: lantern on a post + a pulsing accent ring */}
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

				{/* HTML overlay: crisp text laid over the scaled SVG stage. The
				    3/9px inset aligns the HTML type to the SVG geometry. */}
				<div
					style={{
						position: 'absolute',
						top: 9,
						right: 0,
						bottom: 0,
						left: 3,
						pointerEvents: 'none',
					}}
				>
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
							const origin = HOUSE_ORIGIN[key];
							return (
								<div
									key={key}
									style={{
										position: 'absolute',
										left: origin.x + 54,
										top: origin.y - 40,
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

				{/* Interactive layer: transparent buttons sized off the halo,
				    kept separate from the label overlay so a hidden ordinal
				    digit (under a plaque) is still clickable. Only the current
				    stone launches its workflow; cleared stones re-play; sealed
				    stones are inert. */}
				<div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
					{/* Back to the title screen. Bottom-left is the one corner of the
					    map no house, trail or plaque reaches, and it keeps the exit
					    away from the wordmark and the progress readout. */}
					<button
						type="button"
						className="ow-back"
						onClick={onExit}
						style={{
							position: 'absolute',
							left: 56,
							top: 970,
							pointerEvents: 'auto',
						}}
					>
						<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
							<path
								d="M10,2 L4,8 L10,14"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						MAIN MENU
					</button>

					{nodes.map((n) => (
						<button
							key={n.key}
							type="button"
							className="ow-hit"
							disabled={n.state === 'sealed'}
							onClick={() => onSelect(n.workflowId)}
							title={`${n.title} — ${n.state}`}
							aria-label={`${n.title} — ${
								n.state === 'sealed'
									? 'sealed'
									: n.state === 'current'
										? 'current'
										: 'cleared, replay'
							}`}
							style={{
								position: 'absolute',
								left: n.x - 24,
								top: n.y - 34,
								width: 48,
								height: 56,
								pointerEvents: n.state === 'sealed' ? 'none' : 'auto',
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Houses — each district gets a distinct period building, drawn around
   its door threshold. All four share the ground shadow, lamp halo, arched
   door, drifting vapour, and an identical right-hand signpost; the two
   right-hand districts carry their wall lantern on the inner (tower) side. */
/* ------------------------------------------------------------------ */

function DistrictHouse({
	district,
	color,
}: {
	district: JobAidId;
	color: string;
}) {
	const origin = HOUSE_ORIGIN[district];
	const name = HOUSE_NAME[district];

	return (
		<g transform={`translate(${origin.x} ${origin.y})`}>
			<ellipse cx="0" cy="4" rx="86" ry="18" fill="#120c22" opacity="0.6" />
			<circle cx="0" cy="-46" r="150" fill="url(#ow-lamp)" opacity="0.34" />

			{district === 'bpmh' && <BpmhHouse color={color} />}
			{district === 'oncology' && <OncologyHouse color={color} />}
			{district === 'cpoe' && <CpoeHouse color={color} />}
			{district === 'verification' && <VerificationHouse color={color} />}

			{/* drifting vapour from the chimney/finial */}
			<g
				fill="#c9b8e8"
				opacity="0.16"
				className="ow-smoke"
				style={{ animationDuration: SMOKE_DUR[district] }}
			>
				{district === 'bpmh' && (
					<>
						<circle cx="42" cy="-208" r="7" />
						<circle cx="50" cy="-226" r="9" />
						<circle cx="40" cy="-246" r="11" />
					</>
				)}
				{district === 'oncology' && (
					<>
						<circle cx="-8" cy="-212" r="7" />
						<circle cx="0" cy="-230" r="9" />
						<circle cx="-10" cy="-250" r="11" />
					</>
				)}
				{district === 'cpoe' && (
					<>
						<circle cx="28" cy="-172" r="7" />
						<circle cx="36" cy="-190" r="9" />
						<circle cx="26" cy="-210" r="11" />
					</>
				)}
				{district === 'verification' && (
					<>
						<circle cx="-46" cy="-108" r="7" />
						<circle cx="-38" cy="-126" r="9" />
						<circle cx="-48" cy="-146" r="11" />
					</>
				)}
			</g>

			{/* arched door, centred on the threshold */}
			<path
				d="M-13,0 L-13,-34 Q0,-44 13,-34 L13,0 Z"
				fill="#3a2a1a"
				stroke="#caa14a"
				strokeWidth="1.6"
			/>

			{/* signpost — identical on all four, board to the right */}
			<path d="M84,4 L84,-50" stroke="#4a3d63" strokeWidth="5" />
			<path
				d="M62,-128 L198,-128 L198,-46 L62,-46 Z"
				fill="#1b1230"
				stroke="#caa14a"
				strokeWidth="2"
			/>
			<path
				d="M66,-124 L194,-124 L194,-50 L66,-50 Z"
				fill="none"
				stroke="#caa14a"
				strokeWidth="0.8"
				opacity="0.5"
			/>
			<g transform="translate(130 -104)">
				<DistrictSigil district={district} color={color} />
			</g>
			{name.lines.map((line, i) => (
				<text
					key={i}
					x="130"
					y={name.y[i]}
					textAnchor="middle"
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

/** BPMH — jettied timber-framed apothecary shop with a fold-down counter. */
function BpmhHouse({ color }: { color: string }) {
	return (
		<>
			<path
				d="M-50,0 L-50,-70 L50,-70 L50,0 Z"
				fill="#2a1d47"
				stroke={color}
				strokeWidth="2"
			/>
			<g stroke="#4a3d63" strokeWidth="1.2" opacity="0.6" fill="none">
				<path d="M-50,-26 L50,-26" />
				<path d="M-26,-70 L-26,-26" />
				<path d="M26,-70 L26,-26" />
			</g>
			<path
				d="M-64,-70 L-64,-130 L64,-130 L64,-70 Z"
				fill="#2a1d47"
				stroke={color}
				strokeWidth="2"
			/>
			<path
				d="M-64,-76 L64,-76 L64,-66 L-64,-66 Z"
				fill={color}
				opacity="0.45"
			/>
			<g stroke="#4a3d63" strokeWidth="1.5" opacity="0.85" fill="none">
				<path d="M-32,-130 L-32,-76" />
				<path d="M0,-130 L0,-76" />
				<path d="M32,-130 L32,-76" />
				<path d="M-64,-130 L-32,-76" />
				<path d="M-32,-130 L-64,-76" />
				<path d="M64,-130 L32,-76" />
				<path d="M32,-130 L64,-76" />
			</g>
			<path
				d="M-74,-130 L0,-186 L74,-130 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="2.5"
			/>
			<path
				d="M-74,-130 L74,-130 L74,-122 L-74,-122 Z"
				fill={color}
				opacity="0.45"
			/>
			<path
				d="M32,-158 L32,-196 L50,-196 L50,-145 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="1.6"
			/>
			<rect
				x="-58"
				y="-120"
				width="21"
				height="22"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<rect
				x="37"
				y="-120"
				width="21"
				height="22"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<rect
				x="16"
				y="-56"
				width="30"
				height="26"
				fill="#ffcf8f"
				opacity="0.9"
				filter="url(#ow-glow)"
			/>
			<path
				d="M14,-30 L48,-30 L56,-15 L22,-15 Z"
				fill="#372753"
				stroke="#caa14a"
				strokeWidth="1.4"
			/>
			<path d="M-64,-66 L-78,-66" stroke="#4a3d63" strokeWidth="2.4" />
			<path d="M-78,-66 L-78,-58" stroke="#4a3d63" strokeWidth="1.4" />
			<path
				d="M-84,-58 L-72,-58 L-70,-44 L-86,-44 Z"
				fill="#3a2a1a"
				stroke="#caa14a"
				strokeWidth="1.4"
			/>
			<circle cx="-78" cy="-51" r="4.5" fill="#ffd79a" filter="url(#ow-glow)" />
		</>
	);
}

/** Oncology — domed stillroom / observatory with a copper onion dome. */
function OncologyHouse({ color }: { color: string }) {
	return (
		<>
			<path
				d="M-62,0 L-62,-13 L62,-13 L62,0 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="1.6"
			/>
			<path
				d="M-52,-13 L-52,-68 L-36,-90 L36,-90 L52,-68 L52,-13 Z"
				fill="#2a1d47"
				stroke={color}
				strokeWidth="2"
			/>
			<path
				d="M-36,-90 L-36,-13"
				stroke="#4a3d63"
				strokeWidth="1.2"
				opacity="0.6"
			/>
			<path
				d="M36,-90 L36,-13"
				stroke="#4a3d63"
				strokeWidth="1.2"
				opacity="0.6"
			/>
			<path
				d="M-58,-90 L58,-90 L58,-99 L-58,-99 Z"
				fill={color}
				opacity="0.45"
			/>
			<path
				d="M-52,-99 C-60,-128 -34,-138 -18,-150 C-8,-158 -4,-165 0,-172 C4,-165 8,-158 18,-150 C34,-138 60,-128 52,-99 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="2.5"
			/>
			<path
				d="M-30,-108 C-26,-126 -12,-136 0,-150"
				fill="none"
				stroke={color}
				strokeWidth="1.2"
				opacity="0.5"
			/>
			<path
				d="M30,-108 C26,-126 12,-136 0,-150"
				fill="none"
				stroke={color}
				strokeWidth="1.2"
				opacity="0.5"
			/>
			<circle
				cx="0"
				cy="-118"
				r="11"
				fill="#ffcf8f"
				opacity="0.9"
				filter="url(#ow-glow)"
			/>
			<path d="M0,-172 L0,-196" stroke="#caa14a" strokeWidth="2.5" />
			<path d="M-9,-188 L9,-188" stroke="#caa14a" strokeWidth="1.8" />
			<circle cx="0" cy="-200" r="5" fill="#caa14a" />
			<path
				d="M-38,-30 L-38,-48 Q-27,-60 -16,-48 L-16,-30 Z"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<path
				d="M16,-30 L16,-48 Q27,-60 38,-48 L38,-30 Z"
				fill="#ffcf8f"
				opacity="0.7"
				filter="url(#ow-glow)"
			/>
			<path d="M-74,-6 L-74,-56" stroke="#4a3d63" strokeWidth="3" />
			<path
				d="M-80,-56 L-68,-56 L-66,-42 L-82,-42 Z"
				fill="#3a2a1a"
				stroke="#caa14a"
				strokeWidth="1.4"
			/>
			<circle cx="-74" cy="-49" r="4.5" fill="#ffd79a" filter="url(#ow-glow)" />
		</>
	);
}

/** CPOE — distillery with a copper alembic, swan-neck and oast cowl. */
function CpoeHouse({ color }: { color: string }) {
	return (
		<>
			<path
				d="M-36,0 L-36,-116 L36,-116 L36,0 Z"
				fill="#2a1d47"
				stroke={color}
				strokeWidth="2"
			/>
			<path
				d="M-50,-116 L0,-164 L50,-116 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="2.5"
			/>
			<path
				d="M-50,-116 L50,-116 L50,-108 L-50,-108 Z"
				fill={color}
				opacity="0.45"
			/>
			<path
				d="M15,-133 L33,-133 L29,-156 L21,-156 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="1.6"
			/>
			<path d="M21,-156 L29,-156" stroke={color} strokeWidth="1.6" />
			<circle cx="25" cy="-159" r="3" fill={color} opacity="0.7" />
			<rect
				x="-26"
				y="-98"
				width="22"
				height="20"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<rect
				x="4"
				y="-98"
				width="22"
				height="20"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<path
				d="M-76,0 L-76,-52 L-36,-52 L-36,0 Z"
				fill="#2a1d47"
				stroke={color}
				strokeWidth="1.8"
			/>
			<path
				d="M-82,-52 L-30,-52 L-30,-68 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="2"
			/>
			<path
				d="M-70,0 L-70,-32 Q-56,-44 -42,-32 L-42,0 Z"
				fill="#ffcf8f"
				opacity="0.22"
			/>
			<circle
				cx="-56"
				cy="-21"
				r="13"
				fill="#372753"
				stroke="#caa14a"
				strokeWidth="1.6"
			/>
			<path
				d="M-56,-34 C-56,-45 -40,-47 -40,-37 L-40,-26"
				fill="none"
				stroke="#caa14a"
				strokeWidth="2.2"
			/>
			<ellipse
				cx="-56"
				cy="-5"
				rx="10"
				ry="4"
				fill="#ffcf8f"
				opacity="0.9"
				filter="url(#ow-glow)"
			/>
			<path d="M46,-6 L46,-52" stroke="#4a3d63" strokeWidth="3" />
			<path
				d="M40,-52 L52,-52 L54,-38 L38,-38 Z"
				fill="#3a2a1a"
				stroke="#caa14a"
				strokeWidth="1.4"
			/>
			<circle cx="46" cy="-45" r="4.5" fill="#ffd79a" filter="url(#ow-glow)" />
		</>
	);
}

/** Pharmacist Verification — coursed-ashlar weighing house with a crow-
    stepped gable and a great balance scale. */
function VerificationHouse({ color }: { color: string }) {
	return (
		<>
			<path
				d="M-64,0 L-64,-76 L64,-76 L64,0 Z"
				fill="#2a1d47"
				stroke={color}
				strokeWidth="2"
			/>
			<g stroke="#4a3d63" strokeWidth="1.1" opacity="0.55" fill="none">
				<path d="M-64,-19 L64,-19" />
				<path d="M-64,-38 L64,-38" />
				<path d="M-64,-57 L64,-57" />
				<path d="M-42,-38 L-42,-19" />
				<path d="M42,-38 L42,-19" />
				<path d="M-52,-57 L-52,-38" />
				<path d="M52,-57 L52,-38" />
			</g>
			<path
				d="M-70,-76 L70,-76 L70,-86 L-70,-86 Z"
				fill={color}
				opacity="0.45"
			/>
			<path
				d="M-52,-86 L-52,-100 L-34,-100 L-34,-114 L-16,-114 L-16,-128 L16,-128 L16,-114 L34,-114 L34,-100 L52,-100 L52,-86 Z"
				fill="#241a42"
				stroke={color}
				strokeWidth="2"
			/>
			<g stroke="#caa14a" fill="none">
				<path d="M0,-128 L0,-152" strokeWidth="2.2" />
				<path d="M-30,-152 L30,-152" strokeWidth="2.2" />
				<path d="M-4,-152 L0,-158 L4,-152 Z" fill="#caa14a" strokeWidth="1" />
				<path d="M-30,-152 L-30,-142" />
				<path d="M30,-152 L30,-142" />
				<path
					d="M-39,-142 A9,6 0 0 0 -21,-142 Z"
					fill="#caa14a"
					opacity="0.4"
					strokeWidth="1.4"
				/>
				<path
					d="M21,-142 A9,6 0 0 0 39,-142 Z"
					fill="#caa14a"
					opacity="0.4"
					strokeWidth="1.4"
				/>
			</g>
			<rect
				x="-52"
				y="-50"
				width="20"
				height="22"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<rect
				x="32"
				y="-50"
				width="20"
				height="22"
				fill="#ffcf8f"
				opacity="0.85"
				filter="url(#ow-glow)"
			/>
			<path
				d="M-38,-56 L38,-56 L38,-67 L-38,-67 Z"
				fill="#372753"
				stroke={color}
				strokeWidth="1.4"
			/>
			<path
				d="M-32,-56 L-32,0 L-22,0 L-22,-56 Z"
				fill="#372753"
				stroke={color}
				strokeWidth="1.4"
			/>
			<path
				d="M22,-56 L22,0 L32,0 L32,-56 Z"
				fill="#372753"
				stroke={color}
				strokeWidth="1.4"
			/>
			<path d="M-76,-6 L-76,-56" stroke="#4a3d63" strokeWidth="3" />
			<path
				d="M-82,-56 L-70,-56 L-68,-42 L-84,-42 Z"
				fill="#3a2a1a"
				stroke="#caa14a"
				strokeWidth="1.4"
			/>
			<circle cx="-76" cy="-49" r="4.5" fill="#ffd79a" filter="url(#ow-glow)" />
		</>
	);
}
