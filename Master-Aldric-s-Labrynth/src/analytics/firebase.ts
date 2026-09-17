/**
 * Firebase initialisation — the only module that constructs the SDK
 * singletons. Everything else in `analytics/` and `auth/` asks here.
 *
 * Two rules, both inherited from `state/storage.ts`:
 *
 *   1. NOTHING here may crash the game. This is a training tool; a player
 *      standing in front of a workflow the night before Go-Live must not see
 *      a white screen because a telemetry write failed or the hospital
 *      network blocked googleapis.com.
 *   2. An absent config is a supported state, not an error. With no `.env`
 *      the game runs exactly as it did before Firebase existed — which keeps
 *      `npm run dev` working for anyone who clones this without credentials,
 *      and keeps the Vitest suite free of network stubs.
 *
 * Init is lazy and cached: the SDK is only constructed the first time
 * something actually asks for it, so the title screen paints without waiting
 * on Firebase.
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const config = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

/**
 * Whether enough config is present to talk to Firebase at all.
 *
 * `apiKey` and `projectId` are the two that every product needs, so they
 * stand in for the whole set — a half-filled `.env` is a deploy mistake, and
 * failing closed here turns it into "analytics silently off" rather than a
 * runtime throw in front of a player.
 */
export const isConfigured: boolean = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;

/** The FirebaseApp, or null when unconfigured. Cached after first call. */
function getApp(): FirebaseApp | null {
	if (!isConfigured) return null;
	if (!app) {
		try {
			app = initializeApp(config);
		} catch {
			// Duplicate-app or malformed config. Leave `app` null; every
			// consumer below already handles that as "Firebase unavailable".
			return null;
		}
	}
	return app;
}

let auth: Auth | null = null;

/** Firebase Auth, or null when unconfigured. */
export function getAuthClient(): Auth | null {
	const a = getApp();
	if (!a) return null;
	if (!auth) {
		try {
			auth = getAuth(a);
		} catch {
			return null;
		}
	}
	return auth;
}

let db: Firestore | null = null;

/** Firestore, or null when unconfigured. */
export function getDb(): Firestore | null {
	const a = getApp();
	if (!a) return null;
	if (!db) {
		try {
			db = getFirestore(a);
		} catch {
			return null;
		}
	}
	return db;
}

let analyticsPromise: Promise<Analytics | null> | null = null;

/**
 * Google Analytics (GA4), or null when unavailable.
 *
 * Async and separate from the others because `isSupported()` has to probe the
 * environment first — GA4 needs cookies and IndexedDB, so it is legitimately
 * absent in private browsing, in the Vitest (node) environment, and behind
 * the kind of browser lockdown a hospital SOE tends to ship. It also needs
 * `measurementId`, which only exists if Analytics was enabled on the project.
 *
 * The promise is cached, so the `isSupported()` probe runs once per session.
 */
export function getAnalyticsClient(): Promise<Analytics | null> {
	if (!analyticsPromise) {
		analyticsPromise = (async () => {
			const a = getApp();
			if (!a || !measurementId) return null;
			try {
				return (await isSupported()) ? getAnalytics(a) : null;
			} catch {
				return null;
			}
		})();
	}
	return analyticsPromise;
}
