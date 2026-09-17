import type { BuiltWorkflow, RunState } from '../../game/types';
import { useTheme } from '../../state/useTheme';
import { useMotion } from '../../state/useMotion';
import { SigilSvg } from '../art/DistrictSigil';

/**
 * The Recipe Mastered scene — the payoff shown when a run completes.
 *
 * An illuminated certificate: a wax seal stamps down over the card, the
 * click-path the player learned is inscribed as a numbered recipe, and a stat
 * row tallies how cleanly they ran it. A flawless run (no dead ends, no hints)
 * earns a banner. Laid out in two columns so it reads wide, not tall.
 *
 * Everything here is read-only off the finished `RunState` — no engine or
 * storage changes. `wrongCount`, `hintsRemaining`, and `taken` are already on
 * the run.
 *
 * Motion (the seal stamp, the staggered recipe reveal) is gated on
 * `reduceMotion` rather than left to the global kill switch, because that
 * switch zeroes animation DURATION but not DELAY — a staggered fade would
 * otherwise hold each line invisible through its delay under reduce-motion.
 */

interface CompleteSceneProps {
	workflow: BuiltWorkflow;
	run: RunState;
	/** Where "return" goes back to — the trail map or the ladder. */
	returnLabel: string;
	onReturn: () => void;
}

export function CompleteScene({
	workflow,
	run,
	returnLabel,
	onReturn,
}: CompleteSceneProps) {
	const theme = useTheme();
	const { reduceMotion } = useMotion();

	const color = theme.jobAids[workflow.jobAid].color;
	const hintsUsed = workflow.hints - run.hintsRemaining;
	const deadEnds = run.wrongCount;
	const flawless = deadEnds === 0 && hintsUsed === 0;

	// The animation classes are dropped under reduce-motion so nothing relies
	// on a delayed fade to become visible; the base CSS is the resting state.
	const motion = reduceMotion ? '' : ' is-animated';

	return (
		<div className="complete-scene">
			<div className={`complete-card${motion}`}>
				{/* Wax seal — stamps over the top edge like a seal on a document.
				    The district sigil is embossed into the wax. */}
				<div className="complete-seal" aria-hidden="true">
					<span className="complete-seal__wax">
						<SigilSvg district={workflow.jobAid} color={color} size={34} />
					</span>
				</div>

				{/* Two columns: the certificate copy + tally on the left, the
				    learned recipe on the right, so the card reads wide rather than
				    tall and fits without scrolling. Stacks on a narrow viewport. */}
				<div className="complete-body">
					<div className="complete-main">
						<div className="complete-kicker">
							{theme.labels.workflow} Mastered
						</div>
						<h1 className="complete-title">{workflow.title}</h1>

						{flawless && (
							<div className="complete-flawless">
								Flawless — mastered first try
							</div>
						)}

						<div className="complete-stats">
							<div className="complete-stat">
								<span className="complete-stat__num">{deadEnds}</span>
								<span className="complete-stat__label">
									{deadEnds === 1 ? 'Dead end' : 'Dead ends'}
								</span>
							</div>
							<div className="complete-stat">
								<span className="complete-stat__num">{hintsUsed}</span>
								<span className="complete-stat__label">
									{hintsUsed === 1 ? 'Hint used' : 'Hints used'}
								</span>
							</div>
						</div>

						<button
							type="button"
							className="complete-return"
							onClick={onReturn}
						>
							Return to {returnLabel}
						</button>
					</div>

					<div className="complete-recipe">
						<div className="complete-recipe__label">The recipe you learned</div>
						<ol className="complete-recipe__list">
							{run.taken.map((step, i) => (
								<li
									key={`${step.stepId}:${i}`}
									className="complete-recipe__step"
									style={
										reduceMotion
											? undefined
											: { animationDelay: `${300 + i * 70}ms` }
									}
								>
									{step.label}
								</li>
							))}
						</ol>
					</div>
				</div>
			</div>
		</div>
	);
}
