/**
 * Owns the Firebase Auth session.
 *
 * THE DESIGN: every player gets an anonymous uid the moment the app loads,
 * and signing up LINKS an email to that same uid rather than creating a new
 * one. Three consequences, all deliberate:
 *
 *   1. Play never blocks on a login screen. Staff grabbing ten minutes
 *      before a shift are the audience; a sign-up wall would cost more
 *      completions than the identified data is worth.
 *   2. Someone who plays anonymously and signs up later keeps their history
 *      — same uid, so their earlier attempts are still attributed to them.
 *   3. There is always SOME uid, so `attempts.ts` never has to handle a
 *      "nobody is signed in" case.
 *
 * Signing out returns to a fresh anonymous uid rather than to nothing, for
 * the same reason (3).
 */

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import {
	EmailAuthProvider,
	createUserWithEmailAndPassword,
	linkWithCredential,
	onAuthStateChanged,
	signInAnonymously,
	signInWithEmailAndPassword,
	signOut as fbSignOut,
	type User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getAuthClient, getDb } from '../analytics/firebase';
import { track } from '../analytics/events';
import {
	AuthContext,
	type AuthApi,
	type AuthResult,
	type AuthStatus,
	type AuthUser,
} from './useAuth';

/**
 * Turns a Firebase error code into something a pharmacy tech should read.
 *
 * Firebase's own `.message` strings are developer-facing ("Firebase: Error
 * (auth/invalid-credential).") and leak implementation detail, so every code
 * we can anticipate gets a plain-English replacement.
 */
function humanMessage(code: string): string {
	switch (code) {
		case 'auth/email-already-in-use':
			return 'That email already has an account. Try signing in instead.';
		case 'auth/invalid-email':
			return "That doesn't look like a valid email address.";
		case 'auth/weak-password':
			return 'Password must be at least 6 characters.';
		// Modern Firebase collapses wrong-password and no-such-user into one
		// code on purpose, so an attacker cannot probe which emails exist.
		// Our message has to stay equally vague to preserve that.
		case 'auth/invalid-credential':
		case 'auth/wrong-password':
		case 'auth/user-not-found':
			return 'Email or password is incorrect.';
		case 'auth/too-many-requests':
			return 'Too many attempts. Wait a few minutes and try again.';
		case 'auth/network-request-failed':
			return 'Could not reach the server. Check your connection.';
		case 'auth/operation-not-allowed':
			return 'Email sign-in is not enabled for this project.';
		case 'auth/unauthorized-domain':
			return 'This site is not an authorised domain for sign-in.';
		default:
			return 'Something went wrong. Please try again.';
	}
}

/** Narrows an unknown thrown value to a Firebase error code. */
function errorCode(e: unknown): string {
	return typeof e === 'object' && e !== null && 'code' in e
		? String((e as { code: unknown }).code)
		: 'unknown';
}

function toAuthUser(u: User): AuthUser {
	return { uid: u.uid, email: u.email, isAnonymous: u.isAnonymous };
}

/**
 * Upserts `users/{uid}`. Best-effort — a failure here costs a row in a
 * reporting table, which is not worth blocking a sign-in over.
 *
 * The field set must stay in sync with the `hasOnly` whitelist in
 * firestore.rules; an extra key is rejected server-side as a rules
 * violation, not silently dropped.
 */
async function upsertProfile(u: User): Promise<void> {
	const db = getDb();
	if (!db) return;
	try {
		await setDoc(
			doc(db, 'users', u.uid),
			{
				uid: u.uid,
				email: u.email,
				lastSeenAt: new Date().toISOString(),
			},
			// Merge so a returning player's createdAt is not overwritten.
			{ merge: true },
		);
	} catch {
		// See above — deliberately silent.
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);
	// Resolved from the client itself rather than from `isConfigured` alone,
	// so a config that is present but malformed (initializeApp threw) also
	// starts at 'off' instead of hanging on 'loading' forever. Computing it
	// in the initialiser keeps the effect below free of a synchronous
	// setState, which cascades an extra render.
	const [status, setStatus] = useState<AuthStatus>(() =>
		getAuthClient() ? 'loading' : 'off',
	);

	// Subscribe to the session, and mint an anonymous uid when there is none.
	useEffect(() => {
		const auth = getAuthClient();
		if (!auth) return;

		const unsubscribe = onAuthStateChanged(auth, (u) => {
			if (!u) {
				// No session yet (first visit, or just signed out). Claim an
				// anonymous uid; this fires the listener again with a user.
				void signInAnonymously(auth).catch(() => setStatus('off'));
				return;
			}
			setUser(toAuthUser(u));
			setStatus(u.isAnonymous ? 'anonymous' : 'signedIn');
			void upsertProfile(u);
		});

		return unsubscribe;
	}, []);

	const signUp = useCallback(
		async (email: string, password: string): Promise<AuthResult> => {
			const auth = getAuthClient();
			if (!auth) return { ok: false, message: 'Accounts are unavailable.' };
			try {
				const current = auth.currentUser;
				if (current?.isAnonymous) {
					// The whole point: upgrade this uid in place, keeping every
					// attempt already filed against it.
					const credential = EmailAuthProvider.credential(email, password);
					const { user: linked } = await linkWithCredential(
						current,
						credential,
					);
					setUser(toAuthUser(linked));
					setStatus('signedIn');
					await upsertProfile(linked);
				} else {
					const { user: created } = await createUserWithEmailAndPassword(
						auth,
						email,
						password,
					);
					setUser(toAuthUser(created));
					setStatus('signedIn');
					await upsertProfile(created);
				}
				track({ name: 'sign_up_completed' });
				return { ok: true };
			} catch (e) {
				return { ok: false, message: humanMessage(errorCode(e)) };
			}
		},
		[],
	);

	const signIn = useCallback(
		async (email: string, password: string): Promise<AuthResult> => {
			const auth = getAuthClient();
			if (!auth) return { ok: false, message: 'Accounts are unavailable.' };
			try {
				// Note: this ABANDONS the current anonymous uid and its attempts.
				// Correct — the player is telling us who they already are, and
				// that existing account is the identity that should win.
				const { user: signedIn } = await signInWithEmailAndPassword(
					auth,
					email,
					password,
				);
				setUser(toAuthUser(signedIn));
				setStatus('signedIn');
				await upsertProfile(signedIn);
				track({ name: 'sign_in_completed' });
				return { ok: true };
			} catch (e) {
				return { ok: false, message: humanMessage(errorCode(e)) };
			}
		},
		[],
	);

	const signOut = useCallback(async (): Promise<void> => {
		const auth = getAuthClient();
		if (!auth) return;
		try {
			// The listener above sees the null user and immediately claims a
			// fresh anonymous uid, so play continues uninterrupted.
			await fbSignOut(auth);
		} catch {
			// Nothing useful to do; the session stays as it was.
		}
	}, []);

	const api = useMemo<AuthApi>(
		() => ({ user, status, signUp, signIn, signOut }),
		[user, status, signUp, signIn, signOut],
	);

	return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}
