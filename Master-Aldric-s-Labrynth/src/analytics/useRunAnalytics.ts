/**
 * Reports a run to GA4 and Firestore by diffing `RunState` transitions.
 *
 * Deliberately built the same way as `useRunSounds` in App.tsx: watch the
 * run object change and infer what happened, rather than threading an
 * `onEvent` callback through every scene and door. Two reasons —
 *
 *   1. `game/engine.ts` stays pure. The engine has no idea telemetry
 *      exists, which is the architectural rule the whole project is built
 *      on (see README: no side effects below `state/`).
 *   2. Every transition funnels through one place, so an event cannot be
 *      forgotten when a new scene is added.
 *
 * ONE ATTEMPT ROW PER RUN. GA4 gets the fine-grained events (every wrong
 * door, every hint); Firestore gets a single summary document when the run
 * ends, because Firestore bills per write and a door-by-door stream across
 * 48 workflows would cost real money to learn nothing extra.
 */

import { useEffect, useRef } from 'react';
import type { BuiltWorkflow, RunState } from '../game/types';
import { recordAttempt } from './attempts';
import { track } from './events';

/** True for a run that has not been played yet — fresh, or just restarted. */
function isFresh(run: RunState): boolean {
	return run.wrongCount === 0 && run.taken.length === 0;
}

export function useRunAnalytics(workflow: BuiltWorkflow, run: RunState): void {
	const prevRef = useRef(run);
	/** Latest run, readable from the unmount cleanup without re-subscribing. */
	const runRef = useRef(run);

	// Mirrored in an effect rather than assigned during render: a ref write
	// in the render body is a side effect, which misbehaves under concurrent
	// rendering (and react-hooks/refs rejects it). The commit ordering is
	// what we need anyway — on unmount this holds the last committed run.
	useEffect(() => {
		runRef.current = run;
	}, [run]);

	const startedAtRef = useRef(new Date());
	/** Guards the one-row-per-run rule: a run that already filed its record
	 *  must not file another on unmount. Reset when a restart begins. */
	const recordedRef = useRef(false);

	useEffect(() => {
		track({
			name: 'workflow_started',
			workflow_id: workflow.id,
			job_aid: workflow.jobAid,
		});
	}, [workflow.id, workflow.jobAid]);

	useEffect(() => {
		const prev = prevRef.current;
		prevRef.current = run;
		if (run === prev) return;

		// A restart after a failure rewinds to a fresh run. Treat it as a new
		// attempt: new clock, and the record guard reopens.
		if (isFresh(run) && !isFresh(prev)) {
			startedAtRef.current = new Date();
			recordedRef.current = false;
			track({
				name: 'workflow_started',
				workflow_id: workflow.id,
				job_aid: workflow.jobAid,
			});
			return;
		}

		// A wrong door. Read off `deadEnd` rather than `stepId`, which a wrong
		// pick deliberately leaves untouched.
		if (run.wrongCount > prev.wrongCount && run.deadEnd) {
			track({
				name: 'wrong_door',
				workflow_id: workflow.id,
				step_id: run.deadEnd.stepId,
				door_label: run.deadEnd.label,
			});
		}

		// A hint. Checked independently of status, which spending one leaves
		// unchanged.
		if (run.hintsRemaining < prev.hintsRemaining) {
			track({
				name: 'hint_used',
				workflow_id: workflow.id,
				step_id: run.stepId,
			});
		}

		const hintsUsed = workflow.hints - run.hintsRemaining;

		if (run.status === 'complete' && prev.status !== 'complete') {
			track({
				name: 'workflow_completed',
				workflow_id: workflow.id,
				job_aid: workflow.jobAid,
				wrong_count: run.wrongCount,
				hints_used: hintsUsed,
			});
			if (!recordedRef.current) {
				recordedRef.current = true;
				void recordAttempt(workflow, run, 'complete', startedAtRef.current);
			}
		} else if (run.status === 'failed' && prev.status !== 'failed') {
			track({
				name: 'workflow_failed',
				workflow_id: workflow.id,
				job_aid: workflow.jobAid,
				step_id: run.stepId,
				hints_used: hintsUsed,
			});
			if (!recordedRef.current) {
				recordedRef.current = true;
				void recordAttempt(workflow, run, 'failed', startedAtRef.current);
			}
		}
	}, [run, workflow]);

	// Leaving mid-run. This is the population that plain completion stats
	// hide — someone who opened a workflow, hit a wall at step 3 and walked
	// away never shows up in a completion rate, but is exactly who the
	// training needs to reach.
	//
	// NOTE: under React StrictMode in `npm run dev`, effects mount twice, so
	// you will see a spurious `abandoned` row locally. Production builds do
	// not double-invoke, so real data is unaffected.
	useEffect(() => {
		return () => {
			const r = runRef.current;
			if (recordedRef.current) return;
			if (r.status === 'complete' || r.status === 'failed') return;
			// Nothing happened — opened and immediately backed out. Not worth a row.
			if (isFresh(r)) return;

			recordedRef.current = true;
			track({
				name: 'workflow_abandoned',
				workflow_id: workflow.id,
				job_aid: workflow.jobAid,
				step_id: r.stepId,
				wrong_count: r.wrongCount,
			});
			void recordAttempt(workflow, r, 'abandoned', startedAtRef.current);
		};
	}, [workflow]);
}
