import type { BuiltStep, DoorId, StepId, TakenStep } from '../../game/types';
import { useTheme } from '../../state/useTheme';
import { Door } from '../components/Door';
import { HintButton } from '../components/HintButton';
import { PathTrail } from '../components/PathTrail';
import { getJunctionArt } from '../art/registry';

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
 * Doors render in `step.doors` order — the seeded shuffle — NEVER
 * `correctDoorIds` order. `correctDoorIds` is authored order; rendering
 * doors in that order would put the correct door in the same slot on every
 * visit and leak the answer. `onChoose` is wired straight to `Door`'s click,
 * which the state layer resolves through `engine.choose()` — a correct pick
 * moves `run.stepId` to the next step, which re-renders this component for
 * the new room.
 *
 * "End run" leaves mid-workflow. It needs no confirmation: `useRun` persists
 * every junction, so walking out keeps the run where it stands and re-opening
 * the workflow resumes it.
 */
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
	const hinted = hintedSteps.includes(step.id);
	const art = getJunctionArt(theme.assets.junctionArt);

	return (
		<div className="junction-scene">
			<div className="scene-art scene-art--backdrop">{art}</div>

			<div className="junction-header">
				<div className="junction-location">{step.location}</div>
				<h1 className="junction-prompt">{step.prompt}</h1>
			</div>

			<div className="doors">
				{step.doors.map((door, i) => (
					<Door
						key={door.id}
						door={door}
						glowing={hinted && door.kind === 'correct'}
						onSelect={onChoose}
						sigil={(i % 3) as 0 | 1 | 2}
					/>
				))}
			</div>

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
	);
}
