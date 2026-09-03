/**
 * Persists the one sound setting — muted or not — to localStorage. Kept in
 * state/ because state/ is the only layer that touches localStorage. Load is
 * tolerant of missing or corrupt data, defaulting to unmuted.
 */

const STORAGE_KEY = 'pharmacy-cutover-maze/sound';

/** Reads the muted flag. Any failure falls back to unmuted. */
export function loadMuted(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) === 'muted';
	} catch {
		return false;
	}
}

/** Writes the muted flag. Swallows failures (quota, private browsing). */
export function saveMuted(muted: boolean): void {
	try {
		localStorage.setItem(STORAGE_KEY, muted ? 'muted' : 'on');
	} catch {
		// localStorage unavailable — the setting simply won't survive a reload.
	}
}
