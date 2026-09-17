/**
 * The Firebase seam.
 *
 * These interfaces are the contract the UI programs against — never
 * `firebase/*` directly. A stub in ./stub.ts implements them today so the app
 * builds and the popups render with no backend; the Firebase teammate replaces
 * the stub bodies (through ./index.ts) with real calls against these same
 * shapes, and nothing in state/ or ui/ changes.
 *
 * Deliberately tiny: this is a skeleton. Progression is the single leaderboard
 * metric — the count of recipes a player has completed — because that already
 * exists as `completed.length` in the progress layer.
 */

/** A signed-in account. Email+password auth, so email is the identity. */
export interface AuthUser {
	uid: string;
	email: string;
}

/**
 * Email+password authentication. `subscribe` is how the React layer stays in
 * sync with sign-in/out that may originate anywhere (a real backend fires it
 * on token refresh, sign-out from another tab, etc.).
 */
export interface AuthService {
	/** The user known right now, or null when signed out. */
	getCurrentUser(): AuthUser | null;
	signIn(email: string, password: string): Promise<AuthUser>;
	signOut(): Promise<void>;
	/** Registers a listener; returns an unsubscribe function. */
	subscribe(listener: (user: AuthUser | null) => void): () => void;
}

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
