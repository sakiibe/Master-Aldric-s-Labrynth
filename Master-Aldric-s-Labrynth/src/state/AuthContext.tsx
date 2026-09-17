/**
 * Bridges the auth service (the Firebase seam) into React. Holds the current
 * user in state, subscribes to the service for changes, and exposes signIn/
 * signOut. This is the only place the auth service meets React — components
 * read it through `useAuth`.
 *
 * The context object and `useAuth` hook live in ./useAuth so this file exports
 * only a component (react-refresh/only-export-components).
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services';
import type { AuthUser } from '../services/types';
import { AuthContext, type AuthApi } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(() =>
		authService.getCurrentUser(),
	);

	// Keep in sync with the service — sign-in/out can originate anywhere.
	useEffect(() => authService.subscribe(setUser), []);

	const api = useMemo<AuthApi>(
		() => ({
			user,
			status: user ? 'in' : 'out',
			signIn: async (email, password) => {
				await authService.signIn(email, password);
			},
			signOut: async () => {
				await authService.signOut();
			},
		}),
		[user],
	);

	return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}
