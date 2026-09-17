/**
 * The leaderboard seam.
 *
 * This interface is the contract the UI programs against — never `firebase/*`
 * directly. A stub in ./stub.ts implements it today so the app builds and the
 * popup renders with no backend; the Firebase teammate replaces the stub
 * bodies (through ./index.ts) with real calls against these same shapes, and
 * nothing in ui/ changes.
 *
 * Deliberately tiny: this is a skeleton. Progression is the single leaderboard
 * metric — the count of recipes a player has completed — because that already
 * exists as `completed.length` in the progress layer.
 *
 * Auth is NOT here: it is already Firebase-backed in auth/AuthContext.tsx, and
 * the uid it holds is the identity a real `submit` would file rows under.
 */

/** One ranked row on the leaderboard. */
export interface LeaderboardEntry {
	uid: string;
	/** Display name shown in the list. */
	name: string;
	/** Recipes completed — what the board ranks on. */
	progression: number;
}

/** Reads the ranked board and submits the signed-in player's progression. */
export interface LeaderboardService {
	/** Top entries, already sorted best-first. */
	top(limit?: number): Promise<LeaderboardEntry[]>;
	submit(progression: number): Promise<void>;
}
