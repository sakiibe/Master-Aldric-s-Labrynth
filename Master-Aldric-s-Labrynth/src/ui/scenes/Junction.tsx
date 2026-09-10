import { useEffect, useRef, useState } from 'react';
import type { BuiltStep, DoorId, StepId, TakenStep } from '../../game/types';
import { useSound } from '../../sound/useSound';
import { useTheme } from '../../state/useTheme';
import { Door } from '../components/Door';
import { useMotion } from '../../state/useMotion';
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
/** How long the correct door celebrates (green flare + glob burst) before the
    junction advances. Skipped entirely under reduce-motion. */
const CORRECT_ADVANCE_MS = 500;

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
	const { reduceMotion } = useMotion();
	const [celebrate, setCelebrate] = useState<{
		stepId: StepId;
		index: number;
	} | null>(null);
	// A pending correct-pick advance, and a guard so a second click during the
	// celebration can't fire a second pick.
	const advanceRef = useRef<number | null>(null);
	const pendingRef = useRef(false);
	// Tagged with the step it was made at, rather than cleared when the step
	// changes: a correct pick advances the junction and a backtrack returns to
	// it, and a selection carried across either one would leave the room the
	// player is standing in looking already answered.
	const [pick, setPick] = useState<{ stepId: StepId; index: number } | null>(
		null,
	);
	const picked = pick && pick.stepId === step.id ? pick.index : -1;
	const celebrating =
		celebrate && celebrate.stepId === step.id ? celebrate.index : -1;

	// If the scene unmounts mid-celebration (End Run, backtrack), drop the
	// pending advance so the delayed onChoose can't fire after we're gone.
	useEffect(() => {
		return () => {
			if (advanceRef.current) clearTimeout(advanceRef.current);
		};
	}, []);

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
		if (pendingRef.current) return;
		playSfx('door');
		setPick({ stepId: step.id, index });
		setHover(-1);

		// A correct pick celebrates on the door — green flare + glob burst —
		// then advances after a beat. This fires whether or not the door was
		// hinted, so taking a hint's answer still gets the flourish. A wrong
		// pick (or reduce-motion) advances at once, as before.
		const isCorrect = step.doors[index].kind === 'correct';
		if (isCorrect && !reduceMotion) {
			pendingRef.current = true;
			setCelebrate({ stepId: step.id, index });
			advanceRef.current = window.setTimeout(() => {
				pendingRef.current = false;
				onChoose(doorId);
			}, CORRECT_ADVANCE_MS);
		} else {
			onChoose(doorId);
		}
	};

	return (
		<div className="jn-scene" ref={rootRef}>
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
									celebrating={celebrating === i}
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
