/**
 * Writes one immutable record per finished run to Firestore.
 *
 * This is the half of the analytics that matters. GA4 (`events.ts`) tells
 * you how many people played; this tells you WHERE THEY GOT STUCK, which is
 * the only output a training team can actually act on — "eleven of fourteen
 * people picked `Order Type` at step 3 of Verify Powerplan" turns straight
 * into a slide, a huddle note, or a fix to the job aid.
 *
 * The record is deliberately a flat snapshot of the finished run rather than
 * a stream of deltas: one document per attempt, written once, never edited.
 * That keeps the write cost at exactly one per run (Firestore bills per
 * write, and a 48-workflow game played by a few hundred staff would get
 * expensive fast at one write per door), and it means a dropped write costs
 * you one attempt rather than corrupting a half-built record.
 */

import {
	addDoc,
	collection,
	serverTimestamp,
	type FirestoreDataConverter,
} from 'firebase/firestore';
import type { BuiltWorkflow, RunState, StepId } from '../game/types';
import { getAuthClient, getDb } from './firebase';

/** How a run ended. Mirrors the `outcome` whitelist in firestore.rules. */
export type AttemptOutcome = 'complete' | 'failed' | 'abandoned';

export interface AttemptRecord {
	/** Firebase uid. Anonymous or email — `isAnonymous` distinguishes them. */
	uid: string;
	/** Null until the player signs up. Denormalised so the educator view
	 *  does not need a join against `users` to put a name to a row. */
	email: string | null;
	isAnonymous: boolean;

	workflowId: string;
	/** Which of the four job aids — the district grouping for reporting. */
	jobAid: string;
	workflowTitle: string;

	outcome: AttemptOutcome;

	/** Total wrong doors across the run. */
	wrongCount: number;
	/**
	 * Wrong picks keyed by step. THE payload — a histogram over this field
	 * across all attempts at one workflow is the "which step is hardest"
	 * report. Firestore maps are queryable by known key, and readable
	 * as-is in the console.
	 */
	wrongByStep: Record<StepId, number>;

	hintsUsed: number;
	hintedSteps: StepId[];

	/** Where the run ended — the completing step, or where they died/quit. */
	finalStepId: StepId;
	/** Doors taken in order, for reconstructing the route they walked. */
	path: string[];

	/** Client clock — may be skewed on a locked-down hospital machine. */
	startedAt: string;
	endedAt: string;
	durationMs: number;
}

/**
 * Records a finished attempt. Resolves either way — a failed write is
 * swallowed, because losing one telemetry row must never cost a player
 * their completion screen.
 *
 * Returns true if the row was written, so callers can log in dev if they
 * want; nothing in the game branches on it.
 */
export async function recordAttempt(
	workflow: BuiltWorkflow,
	run: RunState,
	outcome: AttemptOutcome,
	startedAt: Date,
): Promise<boolean> {
	const db = getDb();
	const user = getAuthClient()?.currentUser;
	// No config, or auth has not settled yet. Both are ordinary: the game is
	// designed to run unconfigured, and a very fast first run could in
	// principle finish before anonymous sign-in resolves.
	if (!db || !user) return false;

	const endedAt = new Date();
	const record: AttemptRecord = {
		uid: user.uid,
		email: user.email,
		isAnonymous: user.isAnonymous,

		workflowId: workflow.id,
		jobAid: workflow.jobAid,
		workflowTitle: workflow.title,

		outcome,

		// `| 0` guards the rules' `wrongCount is int` check: Firestore types a
		// JS number as a double unless it is a whole number, and a double
		// here would be rejected server-side as a rules violation.
		wrongCount: run.wrongCount | 0,
		wrongByStep: run.wrongByStep,

		hintsUsed: (workflow.hints - run.hintsRemaining) | 0,
		hintedSteps: run.hintedSteps,

		finalStepId: run.stepId,
		path: run.taken.map((t) => t.label),

		startedAt: startedAt.toISOString(),
		endedAt: endedAt.toISOString(),
		durationMs: endedAt.getTime() - startedAt.getTime(),
	};

	try {
		await addDoc(collection(db, 'attempts'), {
			...record,
			// Server clock, authoritative for ordering. The client pair above
			// is kept because it survives export and is directly readable,
			// but never sort a report by them.
			recordedAt: serverTimestamp(),
		});
		return true;
	} catch {
		// Offline, rules rejection, quota. All silent — see the doc comment.
		return false;
	}
}

/** Unused today; exported so a future educator dashboard can read rows back
 *  with the same shape this module writes. */
export const attemptConverter: FirestoreDataConverter<AttemptRecord> = {
	toFirestore: (a) => ({ ...a }),
	fromFirestore: (snap) => snap.data() as AttemptRecord,
};
