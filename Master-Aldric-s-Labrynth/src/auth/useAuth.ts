/**
 * The auth context and its hook, kept apart from the AuthProvider component
 * so each file exports only one kind of thing (react-refresh/
 * only-export-components) — mirroring the ThemeContext.tsx / useTheme.ts and
 * MotionContext.tsx / useMotion.ts splits.
 */

import { createContext, useContext } from 'react';

/** The parts of a Firebase user this game cares about. */
export interface AuthUser {
	uid: string;
	/** Null for an anonymous player who has not signed up. */
	email: string | null;
	isAnonymous: boolean;
}

/**
 * Where auth has got to.
 *
 * - `loading`  — the SDK has not yet reported; nothing is known.
 * - `anonymous`— a uid exists but no account is attached. The DEFAULT state:
 *                play does not require signing up.
 * - `signedIn` — an email account is attached to this uid.
 * - `off`      — Firebase is unconfigured. The game runs, analytics does not.
 */
export type AuthStatus = 'loading' | 'anonymous' | 'signedIn' | 'off';

/** Outcome of a sign-up / sign-in attempt. `message` is player-facing. */
export type AuthResult = { ok: true } | { ok: false; message: string };

export interface AuthApi {
	user: AuthUser | null;
	status: AuthStatus;
	/**
	 * Creates an account. When the player is currently anonymous this LINKS
	 * the email to their existing uid rather than minting a new one, so the
	 * attempts they already filed stay theirs.
	 */
	signUp: (email: string, password: string) => Promise<AuthResult>;
	signIn: (email: string, password: string) => Promise<AuthResult>;
	/** Signs out and drops straight back to a fresh anonymous uid, so there
	 *  is always an identity to attribute play to. */
	signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthApi | null>(null);

/**
 * Access auth. Outside a provider — and in the Vitest suite, which renders
 * nothing — this reports `off` and rejects every operation, so no consumer
 * has to null-check the context itself.
 */
export function useAuth(): AuthApi {
	const ctx = useContext(AuthContext);
	return (
		ctx ?? {
			user: null,
			status: 'off',
			signUp: async () => ({ ok: false, message: 'Accounts are unavailable.' }),
			signIn: async () => ({ ok: false, message: 'Accounts are unavailable.' }),
			signOut: async () => {},
		}
	);
}
