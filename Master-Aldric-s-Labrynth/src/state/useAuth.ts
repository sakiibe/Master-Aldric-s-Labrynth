/**
 * The auth context and its hook, kept apart from the AuthProvider component so
 * each file exports only one kind of thing (react-refresh/only-export-
 * components) — mirroring the MotionContext.tsx / useMotion.ts split.
 */

import { createContext, useContext } from 'react';
import type { AuthUser } from '../services/types';

export interface AuthApi {
	user: AuthUser | null;
	/** 'loading' only before the first auth state settles. */
	status: 'loading' | 'in' | 'out';
	/** Throws on failure so the login form can surface the message. */
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthApi | null>(null);

/** Access the auth session. Falls back to a signed-out no-op outside a provider. */
export function useAuth(): AuthApi {
	const ctx = useContext(AuthContext);
	return (
		ctx ?? {
			user: null,
			status: 'out',
			signIn: async () => {},
			signOut: async () => {},
		}
	);
}
