/**
 * Wraps the pure engine functions in React state, persisting to
 * localStorage on every change. This is the only place `game/engine.ts`
 * meets React.
 */

import { useCallback, useEffect, useState } from 'react';
import type { BuiltWorkflow, DoorId, RunState } from '../game/types';
import {
	backtrack as engineBacktrack,
	choose as engineChoose,
	progress as engineProgress,
	restart as engineRestart,
	useHint as engineUseHint,
} from '../game/engine';
import { clearRun, loadProgress, markCompleted, saveRun } from './storage';

/**
 * A fresh run, already past the briefing. There is no Briefing scene yet,
 * so a freshly (re)started run should land straight on the first junction.
 */
function initialRun(workflow: BuiltWorkflow): RunState {
	return engineProgress(engineRestart(workflow));
}

export interface UseRunResult {
	run: RunState;
	choose: (doorId: DoorId) => void;
	backtrack: () => void;
	useHint: () => void;
	restart: () => void;
}

export function useRun(workflow: BuiltWorkflow): UseRunResult {
	const [run, setRun] = useState<RunState>(() => {
		const persisted = loadProgress().runs[workflow.id];
		return persisted ?? initialRun(workflow);
	});

	useEffect(() => {
		if (run.status === 'complete') {
			markCompleted(workflow.id);
		} else if (run.status === 'failed') {
			// A failed run does not persist — reload starts the workflow fresh
			// rather than resuming into the failed scene.
			clearRun(workflow.id);
		} else {
			saveRun(workflow.id, run);
		}
	}, [run, workflow.id]);

	const choose = useCallback(
		(doorId: DoorId) => setRun((r) => engineChoose(workflow, r, doorId)),
		[workflow],
	);
	const backtrack = useCallback(() => setRun(engineBacktrack), []);
	const useHint = useCallback(() => setRun(engineUseHint), []);
	const restart = useCallback(() => setRun(initialRun(workflow)), [workflow]);

	return { run, choose, backtrack, useHint, restart };
}
