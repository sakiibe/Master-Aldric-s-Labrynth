/**
 * The Google Analytics (GA4) event taxonomy.
 *
 * GA4 answers the shallow questions — how many people played, how far they
 * got, which districts get opened at all. The deep question ("which step of
 * Verify Powerplan does everyone miss?") is answered by `attempts.ts`
 * writing to Firestore instead, because GA4 aggregates and samples, reports
 * on a ~24h delay, and is routinely blocked by ad blockers and locked-down
 * hospital browsers. Treat anything here as nice-to-have, never as the
 * system of record.
 *
 * The union type below is the whole contract. Adding an event means adding
 * a member, which makes the compiler point at every call site — far better
 * than the usual `logEvent(name: string, params: object)` free-for-all,
 * where a renamed parameter silently splits one metric into two.
 *
 * GA4 constraints baked into this design:
 *   - event names: snake_case, <=40 chars, and NOT prefixed `firebase_`,
 *     `google_` or `ga_` (reserved — such events are silently dropped)
 *   - <=25 parameters per event
 *   - string parameter values are truncated at 100 chars
 */

import { logEvent } from 'firebase/analytics';
import { getAnalyticsClient } from './firebase';

/** Every event the game reports, with its exact parameter shape. */
export type GameEvent =
	/** A workflow was opened — the denominator for completion rate. */
	| {
			name: 'workflow_started';
			workflow_id: string;
			job_aid: string;
	  }
	/** Reached the end of a workflow. `wrong_count` 0 is a clean run. */
	| {
			name: 'workflow_completed';
			workflow_id: string;
			job_aid: string;
			wrong_count: number;
			hints_used: number;
	  }
	/** Ran Aldric's patience out. */
	| {
			name: 'workflow_failed';
			workflow_id: string;
			job_aid: string;
			/** Which step killed the run — the hard-stop blocker. */
			step_id: string;
			hints_used: number;
	  }
	/** Left for the overworld mid-run. Distinguishes "too hard" from "bored". */
	| {
			name: 'workflow_abandoned';
			workflow_id: string;
			job_aid: string;
			step_id: string;
			wrong_count: number;
	  }
	/**
	 * A wrong door. The highest-volume event here, and the one that maps to
	 * a training gap — `step_id` + `door_label` together say "people reach
	 * for THIS button when they should reach for that one".
	 */
	| {
			name: 'wrong_door';
			workflow_id: string;
			step_id: string;
			door_label: string;
	  }
	/** A hint was spent. Softer signal than a wrong door: hesitation. */
	| {
			name: 'hint_used';
			workflow_id: string;
			step_id: string;
	  }
	/** An account was created (anonymous uid upgraded in place). */
	| { name: 'sign_up_completed' }
	/** An existing account signed in. */
	| { name: 'sign_in_completed' };

/**
 * Reports one event to GA4. Fire-and-forget: returns void rather than a
 * promise, so no caller is ever tempted to await telemetry on the path
 * between a player's click and the screen repainting.
 *
 * Silent on every failure, by design. GA4 being unavailable — no config, no
 * consent, private browsing, an ad blocker, a hospital SOE that blocks
 * googletagmanager.com — is an ordinary condition for this app, not an
 * error worth a console message a player might see.
 */
export function track(event: GameEvent): void {
	const { name, ...params } = event;
	void getAnalyticsClient()
		.then((analytics) => {
			if (!analytics) return;
			logEvent(analytics, name, params);
		})
		.catch(() => {
			// Telemetry must never surface to the player. See above.
		});
}
