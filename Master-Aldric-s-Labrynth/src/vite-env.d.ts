/// <reference types="vite/client" />

/**
 * Explicit types for this project's env vars.
 *
 * Vite's own `ImportMetaEnv` carries an index signature, so without these
 * declarations every `import.meta.env.VITE_*` read type-checks as `any` —
 * including misspelled ones, which then surface as `undefined` at runtime in
 * a deployed build. Naming them here turns a typo into a compile error.
 *
 * All six Firebase values are optional (`?`): the game is designed to run
 * unconfigured, so `analytics/firebase.ts` must keep seeing `string |
 * undefined` and branch on it rather than trusting a bare `string`.
 */
interface ImportMetaEnv {
	readonly VITE_FIREBASE_API_KEY?: string;
	readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
	readonly VITE_FIREBASE_PROJECT_ID?: string;
	readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
	readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
	readonly VITE_FIREBASE_APP_ID?: string;
	readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
