/**
 * In-memory stub implementations of the Firebase seam. No backend, no
 * `firebase` dependency — just enough behaviour for the popups to render and
 * toggle during a visual check. The teammate swaps these out in ./index.ts.
 *
 * The auth stub accepts any email+password and keeps the "session" in memory,
 * so signing in visibly flips the Login popup to its signed-in state and
 * signing out flips it back. The leaderboard stub returns a few placeholder
 * rows so the list has something to lay out against.
 */

import type {
	AuthService,
	AuthUser,
	LeaderboardEntry,
	LeaderboardService,
} from './types';

export function createStubAuthService(): AuthService {
	let user: AuthUser | null = null;
	const listeners = new Set<(user: AuthUser | null) => void>();

	const notify = () => listeners.forEach((l) => l(user));

	return {
		getCurrentUser: () => user,
		signIn: async (email) => {
			user = { uid: `stub-${email}`, email };
			notify();
			return user;
		},
		signOut: async () => {
			user = null;
			notify();
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}

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
