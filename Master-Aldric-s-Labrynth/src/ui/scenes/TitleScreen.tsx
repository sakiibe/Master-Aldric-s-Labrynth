import { useEffect, useRef, useState } from 'react';
import { useSound } from '../../sound/useSound';

/**
 * Title screen / landing page — the game's entry point.
 *
 * Recreated from the design handoff
 * (`Game landing page design/design_handoff_title_screen/`), which is a
 * high-fidelity HTML prototype built on a design-prototyping runtime, not
 * portable markup. Layer order, colors, blend modes, and animation timings
 * are the handoff's, verbatim; the hand-drawn CSS button/icon styling is
 * ported here as inline style (the rest of ui/ mixes inline style and a
 * scoped <style> block the same way — see Overworld).
 *
 * Full-viewport key art of Aldric in his maze with an atmosphere pass
 * (lightning, volumetric potion smoke, floor mist, embers) over the top,
 * and a bottom-anchored menu: two primary modes plus How to Play / Settings.
 * Every ambient animation is gated behind `prefers-reduced-motion:
 * no-preference`; under `reduce` the layers hold at a static mid-state.
 *
 * The `art/title-scene.png` percentages for the smoke/glow anchors are
 * calibrated to the current crop (`background-position: center 36%`) — if
 * the art is re-exported, re-anchor them (handoff §Layer 4).
 */

interface TitleScreenProps {
	/** STORY MODE — descend through Aldric's trials. */
	onStoryMode: () => void;
	/** FREE PLAY — wander any maze, no consequence. */
	onFreePlay: () => void;
}

const ART = '/art/title-scene.png';

interface Puff {
	left: string;
	top: string;
	size: number;
	gradient: string;
	anim: string;
	dur: string;
	delay: string;
}

/** Layer 4 — nine potion-smoke puffs. `left`/`top` is each puff's centre
 * (the negative half-size margin is applied in render). */
const PUFFS: Puff[] = [
	{
		left: '66.5%',
		top: '26%',
		size: 190,
		gradient:
			'rgba(206,140,255,0.9), rgba(150,70,240,0.35) 45%, rgba(0,0,0,0) 70%',
		anim: 'ts-smokeRise',
		dur: '7s',
		delay: '0s',
	},
	{
		left: '67.5%',
		top: '27%',
		size: 150,
		gradient:
			'rgba(226,178,255,0.75), rgba(140,60,230,0.3) 50%, rgba(0,0,0,0) 72%',
		anim: 'ts-smokeRise2',
		dur: '9.5s',
		delay: '2.4s',
	},
	{
		left: '65.5%',
		top: '25%',
		size: 120,
		gradient: 'rgba(190,120,255,0.7), rgba(0,0,0,0) 68%',
		anim: 'ts-smokeRise',
		dur: '11s',
		delay: '4.6s',
	},
	{
		left: '5%',
		top: '62%',
		size: 200,
		gradient:
			'rgba(110,255,220,0.7), rgba(40,190,170,0.25) 48%, rgba(0,0,0,0) 72%',
		anim: 'ts-smokeRise2',
		dur: '10s',
		delay: '1.2s',
	},
	{
		left: '8%',
		top: '66%',
		size: 150,
		gradient: 'rgba(150,255,230,0.6), rgba(0,0,0,0) 70%',
		anim: 'ts-smokeRise',
		dur: '13s',
		delay: '6s',
	},
	{
		left: '94%',
		top: '58%',
		size: 210,
		gradient:
			'rgba(120,255,225,0.65), rgba(50,180,255,0.2) 50%, rgba(0,0,0,0) 74%',
		anim: 'ts-smokeRise',
		dur: '12s',
		delay: '3s',
	},
	{
		left: '91%',
		top: '70%',
		size: 160,
		gradient: 'rgba(210,140,255,0.6), rgba(0,0,0,0) 70%',
		anim: 'ts-smokeRise2',
		dur: '8.5s',
		delay: '5.5s',
	},
	{
		left: '12%',
		top: '88%',
		size: 170,
		gradient: 'rgba(190,110,255,0.6), rgba(0,0,0,0) 70%',
		anim: 'ts-smokeRise',
		dur: '9s',
		delay: '2s',
	},
	{
		left: '86%',
		top: '90%',
		size: 150,
		gradient: 'rgba(120,255,215,0.55), rgba(0,0,0,0) 70%',
		anim: 'ts-smokeRise2',
		dur: '11.5s',
		delay: '7s',
	},
];

interface Glow {
	left: string;
	top: string;
	size: number;
	gradient: string;
	blur: number;
	dur: string;
	delay: string;
}

/** Layer 6 — three potion glows (the bright cores under the smoke). */
const GLOWS: Glow[] = [
	{
		left: '66.8%',
		top: '27%',
		size: 88,
		gradient:
			'rgba(236,190,255,0.95), rgba(150,60,240,0.3) 45%, rgba(0,0,0,0) 70%',
		blur: 9,
		dur: '3.6s',
		delay: '0s',
	},
	{
		left: '4.5%',
		top: '63%',
		size: 96,
		gradient: 'rgba(150,255,235,0.8), rgba(0,0,0,0) 68%',
		blur: 11,
		dur: '5.2s',
		delay: '1.1s',
	},
	{
		left: '95%',
		top: '60%',
		size: 104,
		gradient: 'rgba(150,255,235,0.75), rgba(0,0,0,0) 68%',
		blur: 12,
		dur: '4.4s',
		delay: '2.3s',
	},
];

interface Ember {
	left: string;
	bottom: string;
	size: number;
	color: string;
	halo: string;
	dur: string;
	delay: string;
}

/** Layer 7 — five drifting embers. */
const EMBERS: Ember[] = [
	{
		left: '18%',
		bottom: '8%',
		size: 3,
		color: '#ffe6a8',
		halo: '0 0 8px 2px rgba(255,215,140,0.8)',
		dur: '14s',
		delay: '0s',
	},
	{
		left: '34%',
		bottom: '4%',
		size: 2,
		color: '#cbb0ff',
		halo: '0 0 8px 2px rgba(190,150,255,0.8)',
		dur: '19s',
		delay: '3s',
	},
	{
		left: '52%',
		bottom: '6%',
		size: 3,
		color: '#a8ffe6',
		halo: '0 0 9px 2px rgba(140,255,225,0.75)',
		dur: '17s',
		delay: '7s',
	},
	{
		left: '71%',
		bottom: '5%',
		size: 2,
		color: '#ffe6a8',
		halo: '0 0 8px 2px rgba(255,215,140,0.7)',
		dur: '22s',
		delay: '11s',
	},
	{
		left: '84%',
		bottom: '9%',
		size: 3,
		color: '#cbb0ff',
		halo: '0 0 9px 2px rgba(190,150,255,0.7)',
		dur: '16s',
		delay: '5s',
	},
];

/* Primary-button palettes (handoff §Menu UI → Primary row). */
const STORY = {
	border: '1px solid rgba(232,207,143,0.75)',
	bg: 'linear-gradient(180deg, rgba(84,44,140,0.92), rgba(44,20,80,0.94))',
	bgHover:
		'linear-gradient(180deg, rgba(108,58,176,0.96), rgba(58,26,104,0.96))',
	shadow:
		'inset 0 1px 0 rgba(255,236,190,0.28), inset 0 0 26px rgba(150,90,230,0.4), 0 10px 34px rgba(0,0,0,0.6)',
	shadowHover:
		'inset 0 1px 0 rgba(255,240,205,0.4), inset 0 0 34px rgba(186,130,255,0.55), 0 14px 44px rgba(120,60,200,0.45)',
	label: '#f6e6bd',
	labelShadow: '0 0 18px rgba(190,140,255,0.55), 0 2px 2px rgba(0,0,0,0.8)',
	sub: 'rgba(226,208,255,0.72)',
	focus: 'rgba(232,207,143,0.75)',
};
const FREE = {
	border: '1px solid rgba(150,235,215,0.5)',
	bg: 'linear-gradient(180deg, rgba(18,58,66,0.88), rgba(10,30,42,0.92))',
	bgHover: 'linear-gradient(180deg, rgba(26,82,90,0.94), rgba(14,44,58,0.94))',
	shadow:
		'inset 0 1px 0 rgba(190,255,240,0.2), inset 0 0 26px rgba(50,190,170,0.28), 0 10px 34px rgba(0,0,0,0.6)',
	shadowHover:
		'inset 0 1px 0 rgba(200,255,245,0.32), inset 0 0 34px rgba(90,235,205,0.42), 0 14px 44px rgba(40,180,160,0.35)',
	label: '#eaf6e2',
	labelShadow: '0 0 18px rgba(120,255,220,0.4), 0 2px 2px rgba(0,0,0,0.8)',
	sub: 'rgba(206,240,232,0.7)',
	focus: 'rgba(150,235,215,0.5)',
};

type Overlay = 'howto' | 'settings' | null;

export function TitleScreen({ onStoryMode, onFreePlay }: TitleScreenProps) {
	const [overlay, setOverlay] = useState<Overlay>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const { playSfx } = useSound();

	// Return focus and allow Escape to dismiss whichever overlay is open.
	useEffect(() => {
		if (!overlay) return;
		closeRef.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setOverlay(null);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [overlay]);

	return (
		<div style={rootStyle}>
			<style>{CSS}</style>

			{/* Layer 1 — key art */}
			<div
				style={{
					position: 'absolute',
					inset: '-4%',
					backgroundImage: `url('${ART}')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center 36%',
					willChange: 'transform',
				}}
				className="ts-breathe"
			/>

			{/* Layer 2 — key art bloom */}
			<div
				style={{
					position: 'absolute',
					inset: '-4%',
					backgroundImage: `url('${ART}')`,
					backgroundSize: 'cover',
					backgroundPosition: 'center 36%',
					mixBlendMode: 'screen',
					opacity: 0.28,
					filter: 'blur(26px) saturate(1.5)',
					pointerEvents: 'none',
				}}
				className="ts-swayA"
			/>

			{/* Layer 3 — lightning */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					overflow: 'hidden',
				}}
			>
				<div
					className="ts-flashA"
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: '-10%',
						height: '62%',
						background:
							'radial-gradient(60% 70% at 50% 22%, rgba(198,150,255,0.85), rgba(150,90,255,0.25) 45%, rgba(0,0,0,0) 72%)',
						mixBlendMode: 'screen',
					}}
				/>
				<div
					className="ts-flashB"
					style={{
						position: 'absolute',
						inset: 0,
						background:
							'radial-gradient(80% 60% at 22% 8%, rgba(226,214,255,0.8), rgba(120,80,220,0.18) 50%, rgba(0,0,0,0) 78%)',
						mixBlendMode: 'screen',
						animationDelay: '5s',
					}}
				/>
				<div
					className="ts-boltA"
					style={{
						position: 'absolute',
						left: '58%',
						top: '-6%',
						width: 3,
						height: '46%',
						background:
							'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(200,170,255,0.5) 60%, rgba(180,140,255,0) 100%)',
						filter: 'blur(1.6px) drop-shadow(0 0 26px rgba(190,150,255,0.95))',
						transformOrigin: 'top center',
						transform: 'rotate(6deg)',
						animationDelay: '0.02s',
					}}
				/>
				<div
					className="ts-boltA"
					style={{
						position: 'absolute',
						left: '24%',
						top: '-8%',
						width: 2,
						height: '34%',
						background:
							'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(190,160,255,0) 100%)',
						filter: 'blur(1.4px) drop-shadow(0 0 20px rgba(170,130,255,0.9))',
						transformOrigin: 'top center',
						transform: 'rotate(-9deg)',
						animationDuration: '19s',
						animationDelay: '5.03s',
					}}
				/>
			</div>

			{/* Layer 4 — potion smoke */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					mixBlendMode: 'screen',
					filter: 'blur(18px)',
				}}
			>
				{PUFFS.map((p, i) => (
					<div
						key={i}
						className={p.anim}
						style={{
							position: 'absolute',
							left: p.left,
							top: p.top,
							width: p.size,
							height: p.size,
							margin: `${-p.size / 2}px 0 0 ${-p.size / 2}px`,
							borderRadius: '50%',
							opacity: 0.4,
							background: `radial-gradient(circle, ${p.gradient})`,
							animationDuration: p.dur,
							animationDelay: p.delay,
						}}
					/>
				))}
			</div>

			{/* Layer 5 — floor mist */}
			<div
				className="ts-mistDrift"
				style={{
					position: 'absolute',
					left: '-10%',
					right: '-10%',
					bottom: '-6%',
					height: '46%',
					pointerEvents: 'none',
					mixBlendMode: 'screen',
					filter: 'blur(32px)',
					background:
						'radial-gradient(50% 60% at 50% 70%, rgba(80,230,190,0.34), rgba(60,180,255,0.12) 45%, rgba(0,0,0,0) 75%)',
				}}
			/>

			{/* Layer 6 — potion glow */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					mixBlendMode: 'screen',
				}}
			>
				{GLOWS.map((g, i) => (
					<div
						key={i}
						className="ts-potionPulse"
						style={{
							position: 'absolute',
							left: g.left,
							top: g.top,
							width: g.size,
							height: g.size,
							margin: `${-g.size / 2}px 0 0 ${-g.size / 2}px`,
							borderRadius: '50%',
							background: `radial-gradient(circle, ${g.gradient})`,
							filter: `blur(${g.blur}px)`,
							opacity: 0.5,
							animationDuration: g.dur,
							animationDelay: g.delay,
						}}
					/>
				))}
			</div>

			{/* Layer 7 — embers */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					mixBlendMode: 'screen',
				}}
			>
				{EMBERS.map((e, i) => (
					<div
						key={i}
						className="ts-emberFloat"
						style={{
							position: 'absolute',
							left: e.left,
							bottom: e.bottom,
							width: e.size,
							height: e.size,
							borderRadius: '50%',
							background: e.color,
							boxShadow: e.halo,
							opacity: 0.6,
							animationDuration: e.dur,
							animationDelay: e.delay,
						}}
					/>
				))}
			</div>

			{/* Layer 8 — bottom occlusion plate (hides the art's baked-in menu) */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					height: '46%',
					pointerEvents: 'none',
					background:
						'linear-gradient(180deg, rgba(6,3,14,0) 0%, rgba(6,3,14,0.34) 12%, rgba(6,3,14,0.72) 26%, rgba(5,2,12,0.95) 46%, #06040c 66%, #06040c 100%)',
				}}
			/>

			{/* Layer 9 — bottom mist glow */}
			<div
				style={{
					position: 'absolute',
					left: '-10%',
					right: '-10%',
					bottom: '12%',
					height: '22%',
					pointerEvents: 'none',
					mixBlendMode: 'screen',
					filter: 'blur(40px)',
					background:
						'radial-gradient(48% 60% at 50% 100%, rgba(80,230,190,0.3), rgba(120,80,220,0.14) 50%, rgba(0,0,0,0) 78%)',
				}}
			/>

			{/* Layer 10 — vignette */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
					background:
						'radial-gradient(72% 62% at 50% 40%, rgba(0,0,0,0) 42%, rgba(4,2,10,0.5) 76%, rgba(3,1,8,0.9) 100%)',
				}}
			/>

			{/* Layer 11 — menu UI (the only interactive layer) */}
			<div className="ts-uiRise" style={menuStyle}>
				<div style={primaryRowStyle}>
					<PrimaryButton
						palette={STORY}
						label="STORY MODE"
						subtitle="Descend through Aldric's trials"
						onClick={() => {
							playSfx('click');
							onStoryMode();
						}}
					/>
					<PrimaryButton
						palette={FREE}
						label="FREE PLAY"
						subtitle="Wander any maze, no consequence"
						onClick={() => {
							playSfx('click');
							onFreePlay();
						}}
					/>
				</div>

				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						opacity: 0.75,
					}}
				>
					<div
						style={{
							width: 72,
							height: 1,
							background:
								'linear-gradient(90deg, rgba(232,207,143,0), rgba(232,207,143,0.6))',
						}}
					/>
					<div
						style={{
							width: 7,
							height: 7,
							background: '#c68cff',
							transform: 'rotate(45deg)',
							boxShadow: '0 0 12px rgba(190,120,255,0.9)',
						}}
					/>
					<div
						style={{
							width: 72,
							height: 1,
							background:
								'linear-gradient(90deg, rgba(232,207,143,0.6), rgba(232,207,143,0))',
						}}
					/>
				</div>

				<div style={{ display: 'flex', alignItems: 'flex-start', gap: 68 }}>
					<SecondaryButton
						label="HOW TO PLAY"
						onClick={() => {
							playSfx('click');
							setOverlay('howto');
						}}
					>
						<div
							style={{
								width: 18,
								height: 14,
								border: '1.5px solid currentColor',
								borderRadius: 1,
								position: 'relative',
							}}
						>
							<div
								style={{
									position: 'absolute',
									left: '50%',
									top: -1,
									bottom: -1,
									width: 1.5,
									background: 'currentColor',
								}}
							/>
						</div>
					</SecondaryButton>

					<SecondaryButton
						label="SETTINGS"
						onClick={() => {
							playSfx('click');
							setOverlay('settings');
						}}
					>
						<div
							className="ts-runeSpin"
							style={{
								width: 20,
								height: 20,
								border: '1.5px solid currentColor',
								borderRadius: '50%',
								position: 'relative',
							}}
						>
							<div
								style={{
									position: 'absolute',
									left: '50%',
									top: '50%',
									width: 6,
									height: 6,
									margin: '-3px 0 0 -3px',
									border: '1.5px solid currentColor',
									borderRadius: '50%',
								}}
							/>
							<span
								style={{
									position: 'absolute',
									left: '50%',
									top: -4,
									width: 1.5,
									height: 5,
									marginLeft: -0.75,
									background: 'currentColor',
								}}
							/>
							<span
								style={{
									position: 'absolute',
									left: '50%',
									bottom: -4,
									width: 1.5,
									height: 5,
									marginLeft: -0.75,
									background: 'currentColor',
								}}
							/>
							<span
								style={{
									position: 'absolute',
									top: '50%',
									left: -4,
									width: 5,
									height: 1.5,
									marginTop: -0.75,
									background: 'currentColor',
								}}
							/>
							<span
								style={{
									position: 'absolute',
									top: '50%',
									right: -4,
									width: 5,
									height: 1.5,
									marginTop: -0.75,
									background: 'currentColor',
								}}
							/>
						</div>
					</SecondaryButton>
				</div>
			</div>

			{overlay && (
				<div
					role="dialog"
					aria-modal="true"
					aria-label={overlay === 'howto' ? 'How to play' : 'Settings'}
					style={overlayScrimStyle}
					onClick={() => setOverlay(null)}
				>
					<div style={overlayPanelStyle} onClick={(e) => e.stopPropagation()}>
						<button
							ref={closeRef}
							type="button"
							onClick={() => {
								playSfx('click');
								setOverlay(null);
							}}
							style={overlayCloseStyle}
							aria-label="Close"
						>
							✕
						</button>
						{overlay === 'howto' ? (
							<>
								<h2 style={overlayTitleStyle}>How to Play</h2>
								<p style={overlayBodyStyle}>
									Each recipe is a maze. At every junction Master Aldric shows
									you a set of doors — one continues the correct procedure, the
									rest are dead ends. Choose the right door to advance.
								</p>
								<p style={overlayBodyStyle}>
									A wrong door wakes Aldric mid-task and costs you Patience.
									Spend it all and the run resets. Stuck? Spend a Hint to light
									the way.
								</p>
								<p style={overlayBodyStyle}>
									<strong>Story Mode</strong> gates recipes in order and tracks
									what you've learned. <strong>Free Play</strong> opens every
									maze with no cost to failure.
								</p>
							</>
						) : (
							<>
								<h2 style={overlayTitleStyle}>Settings</h2>
								<p style={overlayBodyStyle}>
									Settings aren't wired up yet — audio, motion, and text-size
									controls will live here.
								</p>
								<p style={overlayBodyStyle}>
									The screen already honours your system <em>reduce motion</em>{' '}
									preference: with it on, the ambient lightning, smoke, and
									embers hold still.
								</p>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */

interface PrimaryButtonProps {
	palette: typeof STORY;
	label: string;
	subtitle: string;
	onClick: () => void;
}

function PrimaryButton({
	palette,
	label,
	subtitle,
	onClick,
}: PrimaryButtonProps) {
	const [hover, setHover] = useState(false);
	const [active, setActive] = useState(false);

	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => {
				setHover(false);
				setActive(false);
			}}
			onMouseDown={() => setActive(true)}
			onMouseUp={() => setActive(false)}
			onFocus={() => setHover(true)}
			onBlur={() => setHover(false)}
			style={{
				appearance: 'none',
				font: 'inherit',
				position: 'relative',
				flex: '1 1 240px',
				maxWidth: 290,
				padding: '13px 22px 15px',
				textAlign: 'center',
				cursor: 'pointer',
				border: palette.border,
				borderRadius: 5,
				background: hover ? palette.bgHover : palette.bg,
				boxShadow: hover ? palette.shadowHover : palette.shadow,
				transform: active
					? 'translateY(1px)'
					: hover
						? 'translateY(-2px)'
						: 'none',
				transition:
					'transform 220ms ease, box-shadow 220ms ease, background 220ms ease',
				outlineColor: palette.focus,
				outlineOffset: 3,
			}}
		>
			<span
				style={{
					display: 'block',
					fontSize: 22,
					fontWeight: 700,
					letterSpacing: '0.15em',
					color: palette.label,
					textShadow: palette.labelShadow,
				}}
			>
				{label}
			</span>
			<span
				style={{
					display: 'block',
					marginTop: 4,
					fontFamily: "'Cormorant Garamond', 'Spectral', serif",
					fontStyle: 'italic',
					fontSize: 13,
					letterSpacing: '0.05em',
					color: palette.sub,
				}}
				className="ts-subtitle"
			>
				{subtitle}
			</span>
		</button>
	);
}

interface SecondaryButtonProps {
	label: string;
	onClick: () => void;
	children: React.ReactNode;
}

function SecondaryButton({ label, onClick, children }: SecondaryButtonProps) {
	const [hover, setHover] = useState(false);

	return (
		<button
			type="button"
			onClick={onClick}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onFocus={() => setHover(true)}
			onBlur={() => setHover(false)}
			style={{
				appearance: 'none',
				font: 'inherit',
				background: 'none',
				border: 'none',
				padding: 0,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 10,
				cursor: 'pointer',
				color: hover ? '#fff3d0' : '#e8cf8f',
				transform: hover ? 'translateY(-2px)' : 'none',
				transition: 'color 200ms ease, transform 200ms ease',
				outlineColor: 'rgba(232,207,143,0.75)',
				outlineOffset: 4,
			}}
		>
			<span
				style={{
					width: 46,
					height: 46,
					border: '1px solid rgba(232,207,143,0.55)',
					borderRadius: '50%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background: 'rgba(10,6,20,0.55)',
					boxShadow: 'inset 0 0 16px rgba(150,90,230,0.3)',
				}}
			>
				{children}
			</span>
			<span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.18em' }}>
				{label}
			</span>
		</button>
	);
}

/* ------------------------------------------------------------------ */

const rootStyle: React.CSSProperties = {
	position: 'fixed',
	inset: 0,
	overflow: 'hidden',
	background: '#06040c',
	fontFamily: "'Cinzel', serif",
	userSelect: 'none',
};

const menuStyle: React.CSSProperties = {
	position: 'absolute',
	left: 0,
	right: 0,
	bottom: 0,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	gap: 20,
	padding: '0 24px 38px',
};

const primaryRowStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'stretch',
	gap: 20,
	flexWrap: 'wrap',
	justifyContent: 'center',
	width: '100%',
	maxWidth: 620,
};

const overlayScrimStyle: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	padding: 24,
	background: 'rgba(3,1,8,0.72)',
	backdropFilter: 'blur(3px)',
};

const overlayPanelStyle: React.CSSProperties = {
	position: 'relative',
	width: 'min(460px, 100%)',
	maxHeight: '80vh',
	overflowY: 'auto',
	padding: '28px 30px',
	borderRadius: 8,
	border: '1px solid rgba(232,207,143,0.75)',
	background:
		'linear-gradient(180deg, rgba(36,22,60,0.98), rgba(20,12,36,0.98))',
	boxShadow: 'inset 0 1px 0 rgba(255,236,190,0.2), 0 20px 60px rgba(0,0,0,0.6)',
	color: '#e2d0ff',
};

const overlayTitleStyle: React.CSSProperties = {
	margin: '0 0 14px',
	fontFamily: "'Cinzel', serif",
	fontSize: 20,
	fontWeight: 700,
	letterSpacing: '0.12em',
	color: '#f6e6bd',
	textShadow: '0 0 18px rgba(190,140,255,0.45)',
};

const overlayBodyStyle: React.CSSProperties = {
	margin: '0 0 12px',
	fontFamily: "'Spectral', Georgia, serif",
	fontSize: 15,
	lineHeight: 1.5,
	color: 'rgba(226,208,255,0.85)',
};

const overlayCloseStyle: React.CSSProperties = {
	position: 'absolute',
	top: 10,
	right: 12,
	appearance: 'none',
	background: 'none',
	border: 'none',
	cursor: 'pointer',
	fontSize: 16,
	lineHeight: 1,
	padding: 6,
	color: '#e8cf8f',
};

const CSS = `
	@keyframes ts-breathe { 0%,100% { transform: scale(1.035) translateY(0px); } 50% { transform: scale(1.043) translateY(-7px); } }
	@keyframes ts-swayA { 0%,100% { transform: translate3d(0,0,0) rotate(0deg); } 50% { transform: translate3d(-10px,4px,0) rotate(0.35deg); } }
	@keyframes ts-smokeRise {
		0%   { transform: translate3d(0,0,0) scale(0.55) rotate(0deg); opacity: 0; }
		18%  { opacity: 0.75; }
		60%  { transform: translate3d(14px,-120px,0) scale(1.25) rotate(70deg); opacity: 0.5; }
		100% { transform: translate3d(-18px,-240px,0) scale(2.1) rotate(150deg); opacity: 0; }
	}
	@keyframes ts-smokeRise2 {
		0%   { transform: translate3d(0,0,0) scale(0.6) rotate(0deg); opacity: 0; }
		22%  { opacity: 0.65; }
		100% { transform: translate3d(26px,-210px,0) scale(1.95) rotate(-140deg); opacity: 0; }
	}
	@keyframes ts-mistDrift { 0% { transform: translate3d(-6%,0,0) scale(1.1); } 50% { transform: translate3d(6%,-2%,0) scale(1.25); } 100% { transform: translate3d(-6%,0,0) scale(1.1); } }
	@keyframes ts-flashA { 0%,4.2%,100% { opacity: 0; } 1.1% { opacity: 0.55; } 1.7% { opacity: 0.12; } 2.4% { opacity: 0.72; } 3.2% { opacity: 0.05; } }
	@keyframes ts-flashB { 0%,3%,100% { opacity: 0; } 0.7% { opacity: 0.4; } 1.4% { opacity: 0.08; } 2% { opacity: 0.5; } }
	@keyframes ts-boltA { 0%,2.6%,100% { opacity: 0; } 0.5% { opacity: 0.9; } 1.1% { opacity: 0.15; } 1.6% { opacity: 0.7; } }
	@keyframes ts-emberFloat { 0% { transform: translate3d(0,20px,0); opacity: 0; } 20% { opacity: 0.9; } 100% { transform: translate3d(30px,-320px,0); opacity: 0; } }
	@keyframes ts-potionPulse { 0%,100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.85; transform: scale(1.14); } }
	@keyframes ts-uiRise { 0% { opacity: 0; transform: translateY(24px); } 100% { opacity: 1; transform: translateY(0); } }
	@keyframes ts-runeSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

	.ts-uiRise { animation: ts-uiRise 1.2s cubic-bezier(0.16,1,0.3,1) both; }

	@media (prefers-reduced-motion: no-preference) {
		.ts-breathe { animation: ts-breathe 9s ease-in-out infinite; }
		.ts-swayA { animation: ts-swayA 14s ease-in-out infinite; }
		.ts-mistDrift { animation: ts-mistDrift 26s ease-in-out infinite; }
		.ts-flashA { animation: ts-flashA 13s linear infinite; }
		.ts-flashB { animation: ts-flashB 19s linear infinite; }
		.ts-boltA { animation: ts-boltA 13s linear infinite; }
		.ts-smokeRise { animation: ts-smokeRise 7s ease-out infinite; }
		.ts-smokeRise2 { animation: ts-smokeRise2 9.5s ease-out infinite; }
		.ts-emberFloat { animation: ts-emberFloat 14s linear infinite; }
		.ts-potionPulse { animation: ts-potionPulse 3.6s ease-in-out infinite; }
		.ts-runeSpin { animation: ts-runeSpin 22s linear infinite; }
	}

	@media (max-width: 620px) {
		.ts-subtitle { display: none !important; }
	}
`;
