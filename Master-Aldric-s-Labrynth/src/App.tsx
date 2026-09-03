import { useCallback, useEffect, useRef, useState } from 'react';
import { buildWorkflow } from './game/buildWorkflow';
import { workflows as workflowDefs } from './game/data';
import type { BuiltWorkflow, RunState, WorkflowId } from './game/types';
import { ThemeProvider } from './state/ThemeContext';
import { useTheme } from './state/useTheme';
import { getCompleted } from './state/storage';
import { useRun } from './state/useRun';
import { SoundProvider } from './sound/SoundProvider';
import { useSound } from './sound/useSound';
import { PatienceMeter } from './ui/components/PatienceMeter';
import { SoundControl } from './ui/components/SoundControl';
import { DeadEnd } from './ui/scenes/DeadEnd';
import { Junction } from './ui/scenes/Junction';
import { Overworld } from './ui/scenes/Overworld';
import { TitleScreen } from './ui/scenes/TitleScreen';
import './ui/styles/game.css';

const builtWorkflows: BuiltWorkflow[] = workflowDefs.map(buildWorkflow);
const workflowsById: Record<WorkflowId, BuiltWorkflow> = Object.fromEntries(
	builtWorkflows.map((w) => [w.id, w]),
);

type Scene =
	| { name: 'title' }
	| { name: 'overworld' }
	| { name: 'workflow'; id: WorkflowId };

interface WorkflowScreenProps {
	workflow: BuiltWorkflow;
	onReturnToOverworld: () => void;
}

/**
 * Fires a sound effect on each run transition by diffing the previous run
 * against the current one. Priority order matters: a pick that completes or
 * fails the run plays that outcome, not the plain advance/wrong sound. Hints
 * are checked independently since spending one leaves status unchanged. No
 * sound fires on the initial mount (prev === run).
 */
function useRunSounds(run: RunState): void {
	const { playSfx } = useSound();
	const prevRef = useRef(run);

	useEffect(() => {
		const prev = prevRef.current;
		prevRef.current = run;
		if (run === prev) return;

		if (run.status === 'complete' && prev.status !== 'complete') {
			playSfx('complete');
		} else if (run.status === 'failed' && prev.status !== 'failed') {
			playSfx('failed');
		} else if (run.status === 'deadEnd' && prev.status !== 'deadEnd') {
			playSfx('wrong');
		} else if (prev.status === 'deadEnd' && run.status === 'junction') {
			playSfx('backtrack');
		} else if (
			run.status === 'junction' &&
			run.taken.length > prev.taken.length
		) {
			playSfx('correct');
		}

		if (run.hintsRemaining < prev.hintsRemaining) playSfx('hint');
	}, [run, playSfx]);
}

function WorkflowScreen({
	workflow,
	onReturnToOverworld,
}: WorkflowScreenProps) {
	const theme = useTheme();
	const { playSfx } = useSound();
	const { run, choose, backtrack, useHint, restart } = useRun(workflow);
	useRunSounds(run);

	return (
		<>
			<PatienceMeter
				remaining={run.patienceRemaining}
				total={workflow.patience}
			/>

			{run.status === 'junction' && (
				<Junction
					step={workflow.byId[run.stepId]}
					hintedSteps={run.hintedSteps}
					hintsRemaining={run.hintsRemaining}
					taken={run.taken}
					onChoose={choose}
					onHint={useHint}
				/>
			)}

			{run.status === 'deadEnd' && run.deadEnd && (
				<DeadEnd
					workflow={workflow}
					deadEnd={run.deadEnd}
					onBacktrack={backtrack}
				/>
			)}

			{run.status === 'failed' && run.deadEnd && (
				<div className="fallback-scene">
					<h1>
						{theme.labels.mentor}'s {theme.labels.patience} is spent
					</h1>
					<p className="dialogue-rule">{run.deadEnd.rule}</p>
					<p>{theme.outOfPatienceLine}</p>
					<button
						type="button"
						onClick={() => {
							playSfx('click');
							restart();
						}}
					>
						Begin again
					</button>
					<button type="button" onClick={onReturnToOverworld}>
						Return to {theme.labels.overworld}
					</button>
				</div>
			)}

			{run.status === 'complete' && (
				<div className="fallback-scene">
					<h1>{workflow.title} — complete</h1>
					<p>{run.taken.map((t) => t.label).join(' → ')}</p>
					<button type="button" onClick={onReturnToOverworld}>
						Return to {theme.labels.overworld}
					</button>
				</div>
			)}
		</>
	);
}

function Game() {
	const [scene, setScene] = useState<Scene>({ name: 'title' });
	const [completed, setCompleted] = useState<WorkflowId[]>(() =>
		getCompleted(),
	);
	const { playMusic, playSfx } = useSound();

	// Swap the looping music bed to match the current scene: the mozart menu
	// track on the title screen, the lab bed on the overworld, and the junction
	// bed inside a workflow.
	useEffect(() => {
		const bed =
			scene.name === 'title'
				? 'menu'
				: scene.name === 'overworld'
					? 'overworld'
					: 'junction';
		playMusic(bed);
	}, [scene.name, playMusic]);

	const returnToOverworld = useCallback(() => {
		playSfx('click');
		setCompleted(getCompleted());
		setScene({ name: 'overworld' });
	}, [playSfx]);

	const selectWorkflow = useCallback(
		(id: WorkflowId) => {
			playSfx('click');
			setScene({ name: 'workflow', id });
		},
		[playSfx],
	);

	if (scene.name === 'title') {
		// Story Mode and Free Play both open the one Overworld map today —
		// the engine has no separate free-play flow yet.
		return (
			<TitleScreen
				onStoryMode={() => setScene({ name: 'overworld' })}
				onFreePlay={() => setScene({ name: 'overworld' })}
			/>
		);
	}

	if (scene.name === 'overworld') {
		return (
			<Overworld
				workflows={builtWorkflows}
				completed={completed}
				onSelect={selectWorkflow}
			/>
		);
	}

	return (
		<WorkflowScreen
			workflow={workflowsById[scene.id]}
			onReturnToOverworld={returnToOverworld}
		/>
	);
}

function App() {
	return (
		<ThemeProvider>
			<SoundProvider>
				<SoundControl />
				<Game />
			</SoundProvider>
		</ThemeProvider>
	);
}

export default App;
