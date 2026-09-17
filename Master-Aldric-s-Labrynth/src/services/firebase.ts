/**
 * The Firebase-backed leaderboard — the real implementation of the seam in
 * ./types.ts, swapped in for the stub by ./index.ts whenever config exists.
 *
 * WHY ITS OWN COLLECTION. The obvious home for a ranked board is `users`,
 * which already holds a row per account. It cannot go there: `users` carries
 * email addresses, and a board is by definition readable by other players, so
 * ranking over that collection would publish every player's email to everyone
 * else. `leaderboard/{uid}` is therefore a deliberate, minimal projection —
 * display name and progression, nothing else — and firestore.rules keeps the
 * two collections' read permissions apart.
 *
 * The document id is the uid, so a player has exactly one row that is updated
 * in place. Progression is ratcheted UP-ONLY by firestore.rules, so a player
 * who clears their browser — progress lives in localStorage — cannot knock
 * their own record back down on the next submit.
 *
 * Every operation is best-effort in the same spirit as analytics/attempts.ts:
 * a leaderboard that fails to load must cost a popup, never a play session.
 */

import {
	collection,
	doc,
	getDocs,
	limit as fbLimit,
	orderBy,
	query,
	serverTimestamp,
	setDoc,
} from 'firebase/firestore';
import { getAuthClient, getDb } from '../analytics/firebase';
import { MAX_NAME } from '../auth/useAuth';
import type { LeaderboardEntry, LeaderboardService } from './types';

/** Collection name, shared with the match block in firestore.rules. */
const COLLECTION = 'leaderboard';

export function createFirebaseLeaderboardService(): LeaderboardService {
	return {
		top: async (max) => {
			const db = getDb();
			if (!db) return [];
			try {
				const snap = await getDocs(
					query(
						collection(db, COLLECTION),
						orderBy('progression', 'desc'),
						fbLimit(max ?? 10),
					),
				);
				return snap.docs.map((d) => {
					const data = d.data();
					return {
						uid: d.id,
						// Defensive: these rows are written by clients. The rules
						// constrain the types, but a row predating a rules change
						// could still be odd, and a board is not worth a crash.
						name: typeof data.name === 'string' ? data.name : 'Unknown',
						progression:
							typeof data.progression === 'number' ? data.progression : 0,
					} satisfies LeaderboardEntry;
				});
			} catch {
				// Offline, rules rejection, missing index. The panel renders its
				// empty state.
				return [];
			}
		},

		submit: async (progression) => {
			const db = getDb();
			const user = getAuthClient()?.currentUser;
			if (!db || !user) return;

			// Anonymous players have no name to show, so they are not on the
			// board. Signing up is what puts you on it — and because signing up
			// LINKS the anonymous uid rather than replacing it (see
			// auth/AuthContext.tsx), the progress earned before signing up comes
			// along and lands on the board at the next submit.
			if (user.isAnonymous) return;

			const name = user.displayName?.trim();
			// An account from before display names existed, or one whose owner
			// has not set a name yet. LoginPanel prompts for it; until then
			// there is nothing to label a row with.
			if (!name) return;

			try {
				await setDoc(
					doc(db, COLLECTION, user.uid),
					{
						uid: user.uid,
						name: name.slice(0, MAX_NAME),
						// `| 0` guards the rules' `progression is int` check —
						// Firestore types a JS number as a double unless it is
						// whole, and a double is rejected server-side.
						progression: progression | 0,
						updatedAt: serverTimestamp(),
					},
					{ merge: true },
				);
			} catch {
				// Same contract as the rest of the Firebase layer: silent.
			}
		},
	};
}
