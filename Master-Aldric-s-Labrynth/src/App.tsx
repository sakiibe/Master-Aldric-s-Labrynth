import { useCallback, useEffect, useRef, useState } from 'react';
import { buildWorkflow } from './game/buildWorkflow';
import { workflows as workflowDefs } from './game/data';
import type {
	BuiltWorkflow,
	JobAidId,
	RunState,
	WorkflowId,
} from './game/types';
import { MotionProvider } from './state/MotionContext';
import { ThemeProvider } from './state/ThemeContext';
import { useTheme } from './state/useTheme';
import { getCompleted } from './state/storage';
import {
	hasBriefed,
	hasSeenFinale,
	markBriefed,
	markFinaleSeen,
} from './state/storyStorage';
import { useRun } from './state/useRun';
import { SoundProvider } from './sound/SoundProvider';
import { useSound } from './sound/useSound';
import { BackButton } from './ui/components/BackButton';
import { JobAidPanel } from './ui/components/JobAidPanel';
import { preloadJunctionRoom } from './ui/art/junctionRooms';
import { preloadDeadEndPaintings } from './ui/art/registry';
import { PatienceMeter } from './ui/components/PatienceMeter';
import { SoundControl } from './ui/components/SoundControl';
import { DeadEnd } from './ui/scenes/DeadEnd';
import { Junction } from './ui/scenes/Junction';
import { Overworld } from './ui/scenes/Overworld';
import { OverworldLadder } from './ui/scenes/OverworldLadder';
import { StoryScene } from './ui/scenes/StoryScene';
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

/**
 * Story Mode wraps the workflows in Aldric's hostage plot; Free Play does
 * not. Every story scene therefore carries `from`, and any scene launched
 * from the ladder skips the plot entirely.
 *
 * - `prologue` plays on entering Story Mode, before the map.
 * - `briefing` plays the first time a district's workflow is opened, and
 *   hands straight off to that workflow.
 * - `finale` plays on returning to the map with all 48 complete.
 */
type Scene =
	| { name: 'title' }
	| { name: 'prologue' }
	| { name: 'overworld' }
	| { name: 'ladder' }
	| { name: 'briefing'; jobAid: JobAidId; id: WorkflowId; from: HomeScene }
	| { name: 'workflow'; id: WorkflowId; from: HomeScene }
	| { name: 'finale' };

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

	// Fetch the art up front. A wrong door can land on any of the dead-end
	// scenes with no warning, so decoding one on first sight would flash an
	// empty frame under the dialogue box; and the junction chamber IS the
	// junction screen, which is the very next thing to render.
	useEffect(() => {
		preloadJunctionRoom(theme.assets.junctionArt);
		preloadDeadEndPaintings();
	}, [theme.assets.junctionArt]);

	return (
		<>
			<PatienceMeter
				remaining={run.patienceRemaining}
				total={workflow.patience}
			/>
			<BackButton
				label={`← ${theme.labels.overworld}`}
				onClick={onReturnToOverworld}
			/>

			{/* Mounted for the whole workflow rather than per status: the aid is
			    just as wanted at a dead end, reading the rule that was missed, as
			    it is at a junction. Which of the four PDFs it opens follows from
			    the workflow's district — see ui/components/JobAidPanel.tsx. */}
			{/* Keyed so moving to another district remounts it: the panel's page
			    and open state belong to the aid being read, not to the screen. */}
			<JobAidPanel
				key={workflow.id}
				workflow={workflow}
				stepAidRef={workflow.byId[run.stepId]?.aidRef}
			/>

			{run.status === 'junction' && (
				<Junction
					step={workflow.byId[run.stepId]}
					hintedSteps={run.hintedSteps}
					hintsRemaining={run.hintsRemaining}
					taken={run.taken}
					returnLabel={returnLabel}
					onChoose={choose}
					onHint={useHint}
					onEndRun={onReturnToOverworld}
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
	// track on the title screen, the lab bed on either home screen and over
	// the story scenes (all of which play in Aldric's laboratory), and the
	// junction bed inside a workflow.
	useEffect(() => {
		const bed =
			scene.name === 'title'
				? 'menu'
				: scene.name === 'workflow'
					? 'junction'
					: 'overworld';
		playMusic(bed);
	}, [scene.name, playMusic]);

	/**
	 * Leaving a workflow. In Story Mode, finishing the last of the 48 earns
	 * the ending — checked against freshly-read progress rather than the
	 * `completed` state, which this call is what refreshes.
	 */
	const returnToOverworld = useCallback(() => {
		playSfx('click');
		const done = getCompleted();
		setCompleted(done);
		setScene((s) => {
			const home = s.name === 'workflow' ? s.from : 'overworld';
			if (
				home === 'overworld' &&
				done.length >= builtWorkflows.length &&
				!hasSeenFinale()
			) {
				return { name: 'finale' };
			}
			return { name: home };
		});
	}, [playSfx]);

	// Back one step from the overworld to the title. Refreshes `completed` so
	// the title's mastery plate reflects anything cleared this session.
	const returnToTitle = useCallback(() => {
		playSfx('click');
		setCompleted(getCompleted());
		setScene({ name: 'title' });
	}, [playSfx]);

	/**
	 * Opening a workflow. From the map, the first workflow of a district
	 * plays that district's briefing first — Aldric naming the house he wants
	 * taught. Once per district, not once per workflow: the same demand in
	 * front of all twelve would wear through fast.
	 */
	const selectWorkflow = useCallback(
		(id: WorkflowId) => {
			playSfx('click');
			setScene((s) => {
				const from: HomeScene = s.name === 'ladder' ? 'ladder' : 'overworld';
				const { jobAid } = workflowsById[id];
				if (from === 'overworld' && !hasBriefed(jobAid)) {
					return { name: 'briefing', jobAid, id, from };
				}
				return { name: 'workflow', id, from };
			});
		},
		[playSfx],
	);

	if (scene.name === 'title') {
		return (
			<TitleScreen
				mastered={completed.length}
				total={builtWorkflows.length}
				onStoryMode={() => setScene({ name: 'prologue' })}
				onFreePlay={() => setScene({ name: 'ladder' })}
			/>
		);
	}

	if (scene.name === 'prologue') {
		return (
			<StoryScene
				beats={theme.story.prologue}
				finishLabel={`Enter ${theme.labels.overworld}`}
				onFinish={() => setScene({ name: 'overworld' })}
			/>
		);
	}

	if (scene.name === 'briefing') {
		const { jobAid, id, from } = scene;
		return (
			<StoryScene
				beats={theme.story.briefings[jobAid]}
				finishLabel="Get on with it"
				onFinish={() => {
					markBriefed(jobAid);
					setScene({ name: 'workflow', id, from });
				}}
			/>
		);
	}

	if (scene.name === 'finale') {
		return (
			<StoryScene
				beats={theme.story.finale}
				finishLabel="Go home"
				onFinish={() => {
					markFinaleSeen();
					setScene({ name: 'overworld' });
				}}
			/>
		);
	}

	if (scene.name === 'overworld') {
		return (
			<Overworld
				workflows={builtWorkflows}
				completed={completed}
				onSelect={selectWorkflow}
				onExit={returnToTitle}
			/>
		);
	}

	if (scene.name === 'ladder') {
		return (
			<OverworldLadder
				workflows={builtWorkflows}
				completed={completed}
				onSelect={selectWorkflow}
				onExit={returnToTitle}
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
			<MotionProvider>
				<SoundProvider>
					<SoundControl />
					<Game />
				</SoundProvider>
			</MotionProvider>
		</ThemeProvider>
	);
}

export default App;
