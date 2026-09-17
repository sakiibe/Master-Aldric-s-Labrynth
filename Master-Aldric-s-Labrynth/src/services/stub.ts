/**
 * In-memory stub implementation of the Firebase seam. No backend — just
 * enough behaviour for the Leaderboard popup to render during a visual check.
 * The teammate swaps it out in ./index.ts.
 *
 * The leaderboard stub returns a few placeholder rows so the list has
 * something to lay out against.
 */

import type { LeaderboardEntry, LeaderboardService } from './types';

/** Placeholder rows, best-first — replaced by real query results later. */
const STUB_BOARD: LeaderboardEntry[] = [
	{ uid: 'stub-1', name: 'Master Aldric', progression: 48 },
	{ uid: 'stub-2', name: 'Apprentice Wren', progression: 31 },
	{ uid: 'stub-3', name: 'Novice Calla', progression: 12 },
];

export function createStubLeaderboardService(): LeaderboardService {
	return {
		top: async (limit) => STUB_BOARD.slice(0, limit ?? STUB_BOARD.length),
		submit: async () => {
			// No-op until the backend exists.
		},
	};
}
