/**
 * Persists the Job Aids drawer width to localStorage. Kept in state/ because
 * state/ is the only layer that touches localStorage.
 *
 * Width is a per-player reading preference, not progress — a pharmacist on a
 * wide monitor who drags the aid out to half the screen should not have to do
 * it again every workflow. Unset means "use the default".
 */

const STORAGE_KEY = 'pharmacy-cutover-maze/job-aid-width';

/** Same clamp the grip enforces; re-applied here so a hand-edited or stale value can't wedge the drawer off-screen. */
const MIN = 22;
const MAX = 85;

/** Reads the stored width, or null when unset, unreadable, or out of range. */
export function loadAidWidth(): number | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) return null;
		const width = Number(raw);
		if (!Number.isFinite(width) || width < MIN || width > MAX) return null;
		return Math.round(width);
	} catch {
		return null;
	}
}

/** Writes the width. Swallows failures (quota, private browsing). */
export function saveAidWidth(width: number): void {
	try {
		localStorage.setItem(STORAGE_KEY, String(Math.round(width)));
	} catch {
		// localStorage unavailable — the width simply won't survive a reload.
	}
}
