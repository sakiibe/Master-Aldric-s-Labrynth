/**
 * Persists the reduce-motion preference to localStorage. Kept in state/ because
 * state/ is the only layer that touches localStorage. Defaults to off — motion
 * is on until the player turns it off in Settings.
 */

const STORAGE_KEY = 'pharmacy-cutover-maze/reduce-motion';

/** Reads the stored flag, defaulting to off when unset or unreadable. */
export function loadReduceMotion(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) === 'on';
	} catch {
		return false;
	}
}

/** Writes the flag. Swallows failures (quota, private browsing). */
export function saveReduceMotion(reduce: boolean): void {
	try {
		localStorage.setItem(STORAGE_KEY, reduce ? 'on' : 'off');
	} catch {
		// localStorage unavailable — the setting simply won't survive a reload.
	}
}
