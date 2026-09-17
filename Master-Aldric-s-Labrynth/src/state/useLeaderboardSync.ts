/**
 * Publishes the player's progression — the number of workflows completed — to
 * the leaderboard.
 *
 * WHY A HOOK AND NOT A CALL AT COMPLETION TIME. Progress lives in
 * localStorage and is earned whether or not anyone is signed in, so the
 * moment a row becomes publishable is not the moment a workflow is finished:
 * it is whichever comes later of "has progress" and "has a named account".
 * Watching both and submitting on either change covers all three orderings —
 * play then sign up, sign up then play, and sign in on a machine that already
 * has local progress (which backfills the board immediately).
 *
 * Submitting is idempotent: one document per uid, updated in place, ratcheted
 * up-only by firestore.rules. Re-submitting the same number is a no-op write
 * rather than a duplicate row, so the guard below is a courtesy to the quota,
 * not a correctness requirement.
 */

import { useEffect, useRef } from 'react';
import { leaderboardService } from '../services';
import { useAuth } from '../auth/useAuth';

export function useLeaderboardSync(completedCount: number): void {
	const { user, status } = useAuth();
	// What we last sent, so re-renders (of which there are many — every scene
	// change) do not each cost a write. The name is part of the key because a
	// rename has to relabel the row even though the count has not moved.
	const sentRef = useRef<{ uid: string; name: string; count: number } | null>(
		null,
	);

	useEffect(() => {
		// Only named, signed-in players appear on the board. `submit` enforces
		// this too; checking here avoids waking the Firestore client at all for
		// the anonymous majority.
		if (status !== 'signedIn' || !user?.displayName) return;

		const next = {
			uid: user.uid,
			name: user.displayName,
			count: completedCount,
		};
		const sent = sentRef.current;
		if (
			sent &&
			sent.uid === next.uid &&
			sent.name === next.name &&
			sent.count === next.count
		) {
			return;
		}
		sentRef.current = next;

		void leaderboardService.submit(completedCount);
	}, [status, user?.uid, user?.displayName, completedCount]);
}
