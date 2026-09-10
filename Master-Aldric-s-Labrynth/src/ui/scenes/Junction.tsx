import { useEffect, useRef, useState } from 'react';
import type { BuiltStep, DoorId, StepId, TakenStep } from '../../game/types';
import { useSound } from '../../sound/useSound';
import { useTheme } from '../../state/useTheme';
import { Door } from '../components/Door';
import { HintButton } from '../components/HintButton';
import { PathTrail } from '../components/PathTrail';
import { Torch } from '../components/Torch';
import { getJunctionRoom } from '../art/junctionRooms';

/**
 * The junction — the branching-choice screen, staged in a painted chamber.
 *
 * Three layers, all absolutely positioned in one full-viewport box:
 *
 *  1. BACKDROP — the room art, blurred and dimmed, filling whatever the stage
 *     doesn't cover. It exists only to kill letterboxing; it must never read
 *     as a second copy of the room.
 *  2. STAGE — a box at the art's exact native size holding the art, the door
 *     hotspots and the torches, scaled as ONE unit. Because the hotspots are
 *     children of that box they scale with the art automatically, which is
 *     the entire responsive strategy: there is no second set of coordinates
 *     that could drift out of alignment with the picture.
 *  3. HUD — scrims and content bands pinned to the viewport edges, NOT scaled.
 *     Ordinary responsive CSS, and the game's real hint / path / patience
 *     components rather than anything invented here.
 *
 * Doors render in `step.doors` order — the seeded shuffle — NEVER
 * `correctDoorIds` order, which is authored order and would put the correct
 * answer in the same arch on every visit.
 *
 * Ported from the `Junction Scene` design handoff. Two deliberate departures,
 * both forced by real data: door label plates WRAP (the mock's labels were
 * short enough for `nowrap`; real Cerner button text runs to ~57 characters),
 * and the HUD band heights are measured rather than hardcoded, so a two-line
 * door list or a long path trail still can't crop an arch.
 */

interface JunctionProps {
	step: BuiltStep;
	hintedSteps: StepId[];
	hintsRemaining: number;
	taken: TakenStep[];
	/** Where ending the run goes back to — the trail map or the ladder. */
	returnLabel: string;
	onChoose: (doorId: DoorId) => void;
	onHint: () => void;
	onEndRun: () => void;
}

/**
 * Below this scale the on-art label plates are too small to read and start
 * colliding, so the scene drops to the compact list instead.
 */
const COMPACT_BELOW = 0.68;

/**
 * Pads used ONLY to pick the mode, so that choice is a pure function of the
 * viewport. Deciding it from the measured bands instead would feed back —
 * compact mode adds the door list, which grows the bottom band, which changes
 * the scale, which could flip the mode again.
 */
const MODE_PADS = { top: 112, bot: 124 };

const EMBERS_FULL = 14;
/** Fewer particles once the stage is small — purely a fill-rate saving. */
const EMBERS_COMPACT = 9;

/**
 * The hotspots are invisible by construction, so there has to be some way to
 * see them when the art changes. Dev builds only, off unless asked for:
 * append `?hotspots` to the URL.
 */
const SHOW_HOTSPOTS =
	import.meta.env.DEV &&
	typeof window !== 'undefined' &&
	new URLSearchParams(window.location.search).has('hotspots');

interface Fit {
	s: number;
	cy: number;
}

/**
 * Fits the art's must-see band into the gap the HUD leaves.
 *
 * `cover` is only an upper bound — never scale past filling the viewport.
 * The band fit is the real constraint: it is what guarantees no door is ever
 * cropped. The vertical centre is offset so the ARCH BAND, not the image
 * centre, lands in the gap between the two HUD bands.
 */
function fit(
	vw: number,
	vh: number,
	artW: number,
	artH: number,
	bandW: number,
	topPad: number,
	botPad: number,
	y0: number,
	y1: number,
): Fit {
	const free = Math.max(vh - topPad - botPad, 160);
	const cover = Math.max(vw / artW, vh / artH);
	const s = Math.max(
		Math.min(cover, Math.min(vw / bandW, free / (y1 - y0))),
		0.1,
	);
	const cy = topPad + free / 2 - ((y0 + y1) / 2 - artH / 2) * s;
	return { s, cy };
}

export function Junction({
	step,
	hintedSteps,
	hintsRemaining,
	taken,
	returnLabel,
	onChoose,
	onHint,
	onEndRun,
}: JunctionProps) {
	const theme = useTheme();
	const { playSfx } = useSound();
	const room = getJunctionRoom(theme.assets.junctionArt);
	const hinted = hintedSteps.includes(step.id);

	const rootRef = useRef<HTMLDivElement>(null);
	const topRef = useRef<HTMLDivElement>(null);
	const botRef = useRef<HTMLDivElement>(null);

	const [size, setSize] = useState({ vw: 1200, vh: 700 });
	const [bands, setBands] = useState({ top: 0, bot: 0 });
	const [hover, setHover] = useState(-1);
	// Tagged with the step it was made at, rather than cleared when the step
	// changes: a correct pick advances the junction and a backtrack returns to
	// it, and a selection carried across either one would leave the room the
	// player is standing in looking already answered.
	const [pick, setPick] = useState<{ stepId: StepId; index: number } | null>(
		null,
	);
	const picked = pick && pick.stepId === step.id ? pick.index : -1;

	// Every door in full mode is an invisible hotspot over the painting, so if
	// the painting doesn't load there is nothing on screen to click and the
	// workflow is unplayable. Watch for that and fall back to the list, which
	// needs no art at all — a missing asset should cost the scene its looks,
	// not the run.
	// Records WHICH src failed rather than a bare flag, so swapping rooms can't
	// leave a stale failure standing against art that loads perfectly well.
	const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
	const artBroken = brokenSrc === room.src;
	useEffect(() => {
		const img = new Image();
		img.onerror = () => setBrokenSrc(room.src);
		img.src = room.src;
		return () => {
			img.onerror = null;
		};
	}, [room.src]);

	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;

		const measure = () => {
			const box = root.getBoundingClientRect();
			const vw = Math.round(box.width);
			const vh = Math.round(box.height);
			// A near-zero measurement means the scene is not laid out yet — a
			// background tab, a hidden container, the first frame. Latching it
			// would peg the stage at minimum scale and it would never recover,
			// so throw it away rather than apply it.
			if (vw >= 80 && vh >= 80) {
				setSize((p) => (p.vw === vw && p.vh === vh ? p : { vw, vh }));
			}
			const top = Math.round(
				topRef.current?.getBoundingClientRect().height ?? 0,
			);
			const bot = Math.round(
				botRef.current?.getBoundingClientRect().height ?? 0,
			);
			setBands((p) => (p.top === top && p.bot === bot ? p : { top, bot }));
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(root);
		ro.observe(document.documentElement);
		if (topRef.current) ro.observe(topRef.current);
		if (botRef.current) ro.observe(botRef.current);
		window.addEventListener('resize', measure);
		window.addEventListener('orientationchange', measure);
		// Backstop for containers that get their size after mount without ever
		// firing an observer — poll briefly, then stop.
		const poll = window.setInterval(measure, 400);
		const stopPoll = window.setTimeout(() => window.clearInterval(poll), 4000);

		return () => {
			ro.disconnect();
			window.removeEventListener('resize', measure);
			window.removeEventListener('orientationchange', measure);
			window.clearInterval(poll);
			window.clearTimeout(stopPoll);
		};
	}, []);

	const { vw, vh } = size;
	const bandW = room.band.x1 - room.band.x0;

	// A step whose door count doesn't match the painted arches has no trace to
	// sit on — fall back to the list so every door is still reachable rather
	// than hanging a hotspot over the wrong stonework. Same if the art itself
	// never arrived.
	const tracedDoors = !artBroken && step.doors.length === room.arches.length;

	const modeScale = fit(
		vw,
		vh,
		room.width,
		room.height,
		bandW,
		MODE_PADS.top,
		MODE_PADS.bot,
		room.band.y0,
		room.band.y1,
	).s;
	const compact = !tracedDoors || modeScale < COMPACT_BELOW;

	const y0 = compact ? room.compactBand.y0 : room.band.y0;
	const y1 = compact ? room.compactBand.y1 : room.band.y1;
	const { s, cy } = fit(
		vw,
		vh,
		room.width,
		room.height,
		bandW,
		Math.max(bands.top + 10, 90),
		Math.max(bands.bot + 10, 100),
		y0,
		y1,
	);

	// Counter-scale, so plate text stays legible as the stage shrinks. Capped
	// well below the mock's 1.25: these plates are up to 300px wide rather
	// than 168, and adjacent ones collide before the text gets that big.
	const labelScale = Math.min(Math.max(1 / s, 1), 1.15);

	/**
	 * A door is lit when it is hovered or focused, or — when nothing is —
	 * when it is the standing selection. So hovering a second door previews it
	 * without leaving the first one lit too.
	 */
	const lit = (i: number) => hover === i || (hover === -1 && picked === i);

	/**
	 * The single path every pick takes — the arch hotspots and the compact
	 * list both land here, so the door sound fires once per pick however the
	 * player made it, and can't fall out of sync between the two affordances.
	 *
	 * The sound plays here rather than off the run transition because it is
	 * the door, not the verdict: it should sound the same whether the pick
	 * turns out right or wrong, and it should land on the click rather than
	 * after the engine has decided.
	 */
	const choose = (index: number, doorId: DoorId) => {
		playSfx('door');
		setPick({ stepId: step.id, index });
		setHover(-1);
		onChoose(doorId);
	};

	return (
		<div className="jn-scene" ref={rootRef}>
			<style>{CSS}</style>

			{!artBroken && (
				<div
					className="jn-backdrop"
					style={{ backgroundImage: `url(${room.src})` }}
				/>
			)}

			{!artBroken && (
				<div className="jn-stage-clip">
					<div
						className="jn-stage"
						style={{
							top: Math.round(cy),
							width: room.width,
							height: room.height,
							transform: `translate(-50%, -50%) scale(${s.toFixed(4)})`,
							backgroundImage: `url(${room.src})`,
						}}
					>
						{tracedDoors &&
							step.doors.map((door, i) => (
								<Door
									key={door.id}
									door={door}
									rect={room.arches[i]}
									lit={lit(i)}
									hinted={hinted && door.kind === 'correct'}
									showHotspot={SHOW_HOTSPOTS}
									labelScale={labelScale}
									listed={compact}
									onSelect={(id) => choose(i, id)}
									onHoverChange={(on) => setHover(on ? i : -1)}
								/>
							))}

						{room.torches.map((t) => (
							<div
								key={t.seed}
								className="jn-torch-anchor"
								style={{ left: `${t.x}%`, top: `${t.y}%` }}
							>
								<Torch
									seed={t.seed}
									count={compact ? EMBERS_COMPACT : EMBERS_FULL}
									glow={1}
								/>
							</div>
						))}
					</div>
				</div>
			)}

			{/* The scrims are what make the prompt and the controls readable over
			    a painting at any size. They grow with their band so a wrapped
			    door list or a long path trail never sits on bare art. */}
			<div
				className="jn-scrim jn-scrim--top"
				style={{ '--jn-band': `${bands.top}px` } as React.CSSProperties}
			/>
			<div
				className="jn-scrim jn-scrim--bottom"
				style={{ '--jn-band': `${bands.bot}px` } as React.CSSProperties}
			/>

			<div className="jn-top" ref={topRef}>
				<div className="jn-instruction">
					<div className="jn-eyebrow">{step.location}</div>
					<h1 className="jn-headline">{step.prompt}</h1>
				</div>
			</div>

			<div className="jn-bottom" ref={botRef}>
				{compact && (
					<div className="jn-list">
						{step.doors.map((door, i) => {
							const isHinted = hinted && door.kind === 'correct';
							return (
								<button
									key={door.id}
									type="button"
									className={`jn-list__item${lit(i) ? ' is-lit' : ''}${
										isHinted ? ' is-hinted' : ''
									}`}
									onClick={() => choose(i, door.id)}
									onMouseEnter={() => setHover(i)}
									onMouseLeave={() => setHover(-1)}
									onFocus={() => setHover(i)}
									onBlur={() => setHover(-1)}
									aria-label={
										isHinted
											? `${door.label} — the hint points here`
											: undefined
									}
								>
									{door.label}
									{/* Ties the list back to the picture rather than
									    replacing it — the hotspots stay live in compact
									    mode, so both affordances point at one door. */}
									{tracedDoors && (
										<span className="jn-list__where">{room.archNames[i]}</span>
									)}
								</button>
							);
						})}
					</div>
				)}

				<div className="hint-bar">
					<HintButton
						hintsRemaining={hintsRemaining}
						alreadyHinted={hinted}
						onUse={onHint}
					/>
					<button
						type="button"
						className="end-run-button"
						onClick={onEndRun}
						title={`End run — return to ${returnLabel}`}
					>
						End run
					</button>
				</div>

				<PathTrail taken={taken} />
			</div>
		</div>
	);
}

/* Scoped to this scene, in the shape OverworldLadder uses for the same
   reason: a ported handoff carries its own palette, and game.css is the file
   that holds the no-colour-literal rule.

   Everything literal below is scene ART DRESSING — the arcane violet the
   chamber is painted in, the scrim that is really the picture's own shadow.
   Anything with a theme meaning (ink, muted ink, the hint's green, the gold
   controls) reads its token instead, so the junction still recolours with the
   rest of the game. */
const CSS = `
  .jn-scene {
    --jn-edge: rgba(226, 178, 255, 0.95);
    --jn-bloom: rgba(178, 96, 255, 0.55);
    --jn-fill: rgba(160, 78, 240, 0.28);
    --jn-inner: rgba(158, 74, 235, 0.45);
    --jn-plate-edge: rgba(198, 150, 245, 0.55);
    --jn-plate: linear-gradient(180deg, rgba(46,26,68,.94), rgba(30,17,48,.94));
    --jn-lit-edge: rgba(233, 195, 255, 0.95);
    --jn-lit: linear-gradient(180deg, rgba(86,44,132,.95), rgba(52,26,84,.95));
    --jn-hint: color-mix(in srgb, var(--color-correct) 60%, transparent);

    /* z-index:0 rather than plain position:relative, so the layers below
       stack against this box and not the document root. */
    position: relative;
    z-index: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    min-height: 480px;
    overflow: hidden;
    background: var(--color-bg);
    color: var(--color-ink);
    user-select: none;
  }

  /* Fills the letterbox when the stage doesn't cover the viewport. Blurred
     hard enough that it can't be mistaken for a second room. */
  .jn-backdrop {
    position: absolute;
    inset: -6%;
    background-size: cover;
    background-position: center;
    filter: blur(34px) brightness(0.42) saturate(0.8);
    pointer-events: none;
  }

  .jn-stage-clip { position: absolute; inset: 0; overflow: hidden; }

  /* Native-size box; the inline transform is the only thing that resizes it,
     so hotspots and torch effects ride along in art coordinates. */
  .jn-stage {
    position: absolute;
    left: 50%;
    transform-origin: 50% 50%;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    box-shadow: 0 0 90px 30px rgba(21, 14, 31, 0.9);
  }

  /* ---- door hotspot ---- */

  .jn-door {
    position: absolute;
    padding: 0;
    margin: 0;
    border: 0;
    background: transparent;
    /* Set explicitly: without it the plate text inherits the browser's
       default black button colour and vanishes against the dark plate. */
    color: var(--color-ink);
    font-family: var(--font-ui);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  /* The arch glow IS the focus indicator, and a far clearer one than a ring
     around an invisible box would be — but forced-colours mode throws the
     glow away, so put a real outline back for it. */
  .jn-door:focus { outline: none; }
  @media (forced-colors: active) {
    .jn-door:focus-visible { outline: 2px solid CanvasText; outline-offset: 2px; }
  }

  .jn-door__glow,
  .jn-door__trace,
  .jn-door__plate { pointer-events: none; }

  /* Bleeds outside the hit region so the glow hugs the painted stonework
     rather than sitting inside it. */
  .jn-door__glow {
    position: absolute;
    inset: -6% -8%;
    border-radius: 50% 50% 5% 5% / 31% 31% 2% 2%;
    border: 2px solid var(--jn-edge);
    box-shadow: 0 0 42px 8px var(--jn-bloom), inset 0 0 52px 6px var(--jn-inner);
    background: radial-gradient(ellipse at 50% 62%, var(--jn-fill), rgba(120,50,200,0) 72%);
    animation: jn-arch-pulse 2.8s ease-in-out infinite;
    opacity: 0;
    transition: opacity 180ms ease;
  }

  .jn-door.is-lit .jn-door__glow { opacity: 1; }

  /* A spent hint marks the correct door in the game's green and holds it —
     it is a standing answer, not a hover state, so it never gates on lit. */
  .jn-door.is-hinted .jn-door__glow {
    opacity: 1;
    border-color: var(--color-correct);
    background: radial-gradient(ellipse at 50% 62%, var(--jn-hint), rgba(120,50,200,0) 72%);
    box-shadow: 0 0 42px 8px var(--jn-hint), inset 0 0 52px 6px var(--jn-hint);
  }

  /* The handoff put a slow-spinning dashed "sigil ring" here too. Dropped:
     sized off the hotspot's WIDTH and forced square, it came out as a circle
     far shorter than the arch it sat in, so it read as a stray ellipse
     spilling past the stonework rather than a sigil inscribed on the door —
     and the label plate covered its bottom third anyway. The arch glow marks
     the hovered door on its own, and does it more cleanly. */

  .jn-door__trace {
    position: absolute;
    inset: 0;
    border-radius: 50% 50% 5% 5% / 31% 31% 2% 2%;
    outline: 1px dashed rgba(120, 255, 210, 0.9);
    outline-offset: 2px;
    background: rgba(60, 255, 200, 0.1);
  }

  /* 118px is in UNSCALED STAGE UNITS — that is what keeps all three plates on
     one visual line despite the arches being painted at different heights. */
  .jn-door__plate {
    position: absolute;
    left: 50%;
    bottom: 118px;
    transform-origin: 50% 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: max-content;
    min-width: 168px;
    /* Real Cerner button labels run long, so the plate wraps instead of the
       mock's nowrap. 300px keeps two neighbours clear of each other even at
       the largest counter-scale. */
    max-width: 300px;
    min-height: 44px;
    padding: 9px 20px;
    border-radius: 6px;
    border: 1px solid var(--jn-plate-edge);
    background: var(--jn-plate);
    box-shadow: 0 8px 22px rgba(10, 4, 20, 0.55);
    transition: opacity 180ms ease;
  }

  .jn-door__plate-lit {
    position: absolute;
    inset: -1px;
    border-radius: 6px;
    border: 1px solid var(--jn-lit-edge);
    background: var(--jn-lit);
    box-shadow: 0 0 20px rgba(176, 98, 250, 0.6);
    opacity: 0;
    transition: opacity 180ms ease;
  }

  .jn-door.is-lit .jn-door__plate-lit { opacity: 1; }

  .jn-door.is-hinted .jn-door__plate-lit {
    opacity: 1;
    border-color: var(--color-correct);
    box-shadow: 0 0 20px var(--jn-hint);
  }

  .jn-door__plate-text {
    position: relative;
    font-size: 17px;
    line-height: 1.25;
    letter-spacing: 0.01em;
    text-align: center;
    text-wrap: pretty;
    overflow-wrap: break-word;
  }

  /* ---- torches ---- */

  .jn-torch-anchor {
    position: absolute;
    width: 0;
    height: 0;
    z-index: 3;
    pointer-events: none;
  }

  .jn-torch { position: absolute; left: 0; top: 0; width: 0; height: 0; }

  .jn-torch__bloom {
    position: absolute;
    left: -95px;
    top: -95px;
    width: 190px;
    height: 190px;
    border-radius: 50%;
    filter: blur(2px);
    background: radial-gradient(circle,
      rgba(214, 152, 255, var(--bloom-a)) 0%,
      rgba(160, 74, 240, var(--bloom-b)) 34%,
      rgba(120, 50, 200, 0) 68%);
    animation: jn-torch-bloom 1.9s ease-in-out infinite;
  }

  .jn-torch__core {
    position: absolute;
    left: -7.5px;
    top: -14px;
    width: 15px;
    height: 30px;
    border-radius: 50% 50% 44% 44% / 68% 68% 32% 32%;
    background: radial-gradient(ellipse at 50% 74%,
      rgba(255, 255, 255, 0.92) 0%,
      rgba(233, 186, 255, 0.85) 30%,
      rgba(178, 96, 255, 0.55) 62%,
      rgba(150, 60, 230, 0) 100%);
    filter: blur(1.5px);
    transform-origin: 50% 100%;
    animation: jn-torch-flame 0.42s ease-in-out infinite;
  }

  /* Starts invisible: emberRise fades each one in, and a negative delay drops
     it into the middle of that. Without the animation it stays hidden, which
     is exactly what reduced motion wants. */
  .jn-ember {
    position: absolute;
    top: -10px;
    border-radius: 50%;
    opacity: 0;
    background: rgba(224, 178, 255, 0.95);
    box-shadow: 0 0 6px rgba(190, 110, 255, 0.85);
    animation-name: jn-ember-rise;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  .jn-ember--warm {
    background: rgba(255, 226, 178, 0.95);
    box-shadow: 0 0 6px rgba(255, 196, 120, 0.85);
  }

  @keyframes jn-arch-pulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.35); }
  }

  @keyframes jn-torch-bloom {
    0%   { transform: scale(1);                      opacity: 0.78; }
    18%  { transform: scale(1.14);                   opacity: 1; }
    31%  { transform: translateX(-1%) scale(0.94);   opacity: 0.66; }
    47%  { transform: translateY(-1%) scale(1.09);   opacity: 0.95; }
    63%  { transform: translateX(1%) scale(0.99);    opacity: 0.8; }
    81%  { transform: translateY(1%) scale(1.16);    opacity: 1; }
    100% { transform: scale(1);                      opacity: 0.78; }
  }

  @keyframes jn-torch-flame {
    0%   { transform: scaleY(1) scaleX(1);                            opacity: 0.9; }
    22%  { transform: translateY(-6%) scaleY(1.2) scaleX(0.86);       opacity: 1; }
    40%  { transform: translateX(-2%) scaleY(0.88) scaleX(1.08);      opacity: 0.72; }
    58%  { transform: translate(2%, -4%) scaleY(1.14) scaleX(0.92);   opacity: 0.96; }
    76%  { transform: scaleY(0.96) scaleX(1.04);                      opacity: 0.82; }
    100% { transform: scaleY(1) scaleX(1);                            opacity: 0.9; }
  }

  @keyframes jn-ember-rise {
    0%   { transform: translate(0, 0) scale(0.5); opacity: 0; }
    12%  { opacity: 1; }
    50%  { transform: translate(var(--dx1), calc(var(--rise) * -0.5)) scale(1); }
    100% { transform: translate(var(--dx2), calc(var(--rise) * -1)) scale(0.25); opacity: 0; }
  }

  /* The torches keep burning in the mock; here they hold still instead. The
     flame and bloom are positioned statically, so switching the animations
     off leaves them exactly where they were. */
  @media (prefers-reduced-motion: reduce) {
    .jn-door__glow,
    .jn-torch__bloom,
    .jn-torch__core { animation: none; }
    .jn-ember { display: none; }
  }

  /* ---- HUD ---- */

  .jn-scrim {
    position: absolute;
    left: 0;
    right: 0;
    pointer-events: none;
  }

  .jn-scrim--top {
    top: 0;
    height: max(46%, calc(var(--jn-band) + 40px));
    background: linear-gradient(180deg,
      rgba(14, 8, 22, 0.94) 0%, rgba(14, 8, 22, 0.76) 40%, rgba(14, 8, 22, 0) 100%);
  }

  .jn-scrim--bottom {
    bottom: 0;
    height: max(42%, calc(var(--jn-band) + 40px));
    background: linear-gradient(0deg,
      rgba(14, 8, 22, 0.92) 0%, rgba(14, 8, 22, 0.5) 55%, rgba(14, 8, 22, 0) 100%);
  }

  .jn-top {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    padding: 14px 16px;
  }

  /* The mute toggle and the patience meter are the game's own fixed chrome in
     these two corners. Wide enough, and the prompt sits between them; below
     that they overlap it, so it drops beneath them instead. */
  @media (min-width: 1024px) {
    .jn-top { padding-left: 220px; padding-right: 220px; }
  }
  @media (max-width: 1023px) {
    .jn-top {
      padding-top: calc(var(--chrome-inset) + var(--chrome-height) + 10px);
    }
  }

  .jn-instruction { max-width: 900px; margin: 0 auto; text-align: center; }

  .jn-eyebrow {
    font-family: var(--font-display);
    font-size: clamp(10px, 1.3vw, 12px);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-ink-muted);
  }

  .jn-headline {
    margin: 6px 0 0;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(16px, 2.5vw, 27px);
    line-height: 1.3;
    color: var(--color-ink);
    text-wrap: pretty;
    text-shadow: 0 2px 14px rgba(8, 4, 16, 0.9);
  }

  .jn-bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 0 12px 12px;
  }

  .jn-bottom .hint-bar { margin-bottom: 0; }

  .jn-bottom .path-trail {
    width: 100%;
    max-width: 1180px;
    box-sizing: border-box;
  }

  .jn-list {
    width: 100%;
    max-width: 1180px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .jn-list__item {
    flex: 1 1 220px;
    min-width: 0;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 8px;
    border: 1px solid var(--jn-plate-edge);
    background: var(--jn-plate);
    color: var(--color-ink);
    font-family: var(--font-ui);
    font-size: 16px;
    text-align: left;
    cursor: pointer;
    transition: box-shadow 180ms ease, border-color 180ms ease;
  }

  .jn-list__item.is-lit {
    border-color: var(--jn-lit-edge);
    box-shadow: 0 0 22px rgba(176, 98, 250, 0.55);
  }

  .jn-list__item.is-hinted {
    border-color: var(--color-correct);
    box-shadow: 0 0 22px var(--jn-hint);
  }

  .jn-list__where {
    flex: none;
    font-size: 13px;
    color: var(--color-ink-muted);
  }
`;
