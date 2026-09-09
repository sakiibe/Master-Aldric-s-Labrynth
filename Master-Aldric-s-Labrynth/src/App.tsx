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
import { preloadDeadEndPaintings } from './ui/art/registry';
import { PatienceMeter } from './ui/components/PatienceMeter';
import { SoundControl } from './ui/components/SoundControl';
import { DeadEnd } from './ui/scenes/DeadEnd';
import { Junction } from './ui/scenes/Junction';
import { Overworld } from './ui/scenes/Overworld';
import { OverworldLadder } from './ui/scenes/OverworldLadder';
import { TitleScreen } from './ui/scenes/TitleScreen';
import './ui/styles/game.css';

const builtWorkflows: BuiltWorkflow[] = workflowDefs.map(buildWorkflow);
const workflowsById: Record<WorkflowId, BuiltWorkflow> = Object.fromEntries(
	builtWorkflows.map((w) => [w.id, w]),
);

/**
 * Story Mode opens the gated trail map, Free Play the flat ladder. They are
 * two presentations of the same 48 workflows over the same progress, so a
 * workflow remembers which one launched it and returns there.
 */
type HomeScene = 'overworld' | 'ladder';

type Scene =
	| { name: 'title' }
	| { name: 'overworld' }
	| { name: 'ladder' }
	| { name: 'workflow'; id: WorkflowId; from: HomeScene };

interface WorkflowScreenProps {
	workflow: BuiltWorkflow;
	/** Where "return" goes back to — the trail map or the ladder. */
	returnLabel: string;
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
	returnLabel,
	onReturnToOverworld,
}: WorkflowScreenProps) {
	const theme = useTheme();
	const { playSfx } = useSound();
	const { run, choose, backtrack, useHint, restart } = useRun(workflow);
	useRunSounds(run);

	// Fetch the dead-end art up front — a wrong door can land on any of the
	// scenes with no warning, so decoding one on first sight would flash an
	// empty frame under the dialogue box.
	useEffect(() => {
		preloadDeadEndPaintings();
	}, []);

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
						Return to {returnLabel}
					</button>
				</div>
			)}

			{run.status === 'complete' && (
				<div className="fallback-scene">
					<h1>{workflow.title} — complete</h1>
					<p>{run.taken.map((t) => t.label).join(' → ')}</p>
					<button type="button" onClick={onReturnToOverworld}>
						Return to {returnLabel}
					</button>
				</div>
			)}
		</>
	);
}

function Game() {
	const theme = useTheme();
	const [scene, setScene] = useState<Scene>({ name: 'title' });
	const [completed, setCompleted] = useState<WorkflowId[]>(() =>
		getCompleted(),
	);
	const { playMusic, playSfx } = useSound();

	// Swap the looping music bed to match the current scene: the mozart menu
	// track on the title screen, the lab bed on either home screen, and the
	// junction bed inside a workflow.
	useEffect(() => {
		const bed =
			scene.name === 'title'
				? 'menu'
				: scene.name === 'overworld' || scene.name === 'ladder'
					? 'overworld'
					: 'junction';
		playMusic(bed);
	}, [scene.name, playMusic]);

	const returnToOverworld = useCallback(() => {
		playSfx('click');
		setCompleted(getCompleted());
		setScene((s) => ({ name: s.name === 'workflow' ? s.from : 'overworld' }));
	}, [playSfx]);

	const selectWorkflow = useCallback(
		(id: WorkflowId) => {
			playSfx('click');
			setScene((s) => ({
				name: 'workflow',
				id,
				from: s.name === 'ladder' ? 'ladder' : 'overworld',
			}));
		},
		[playSfx],
	);

	if (scene.name === 'title') {
		return (
			<TitleScreen
				onStoryMode={() => setScene({ name: 'overworld' })}
				onFreePlay={() => setScene({ name: 'ladder' })}
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

	if (scene.name === 'ladder') {
		return (
			<OverworldLadder
				workflows={builtWorkflows}
				completed={completed}
				onSelect={selectWorkflow}
			/>
		);
	}

	return (
		<WorkflowScreen
			workflow={workflowsById[scene.id]}
			returnLabel={
				scene.from === 'ladder' ? 'the Ladder of Rites' : theme.labels.overworld
			}
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
