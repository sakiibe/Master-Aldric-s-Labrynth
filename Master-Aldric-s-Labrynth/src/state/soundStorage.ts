/**
 * Persists the sound settings — music volume and SFX volume — to localStorage.
 * Kept in state/ because state/ is the only layer that touches localStorage.
 * There is no separate "muted" flag: muting the music is simply its volume at
 * zero, so the corner mute button and the music slider stay in sync. Load is
 * tolerant of missing or corrupt data and migrates older shapes (a bare
 * 'muted'/'on' string, or JSON carrying a `muted` boolean).
 */

const STORAGE_KEY = 'pharmacy-cutover-maze/sound';

export interface SoundSettings {
	/** Master gain for the music bed, 0..1. Zero reads as "muted". */
	musicVolume: number;
	/** Master gain for one-shot SFX, 0..1. */
	sfxVolume: number;
}

const DEFAULTS: SoundSettings = {
	musicVolume: 1,
	sfxVolume: 1,
};

/** Clamps to 0..1, falling back to the default when the value isn't a number. */
function clampVolume(value: unknown, fallback: number): number {
	if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
	return Math.min(1, Math.max(0, value));
}

/** Reads the settings. Any failure or unknown shape falls back to defaults. */
export function loadSoundSettings(): SoundSettings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) return { ...DEFAULTS };
		// Legacy format: the whole value was the muted flag as a bare string.
		if (raw === 'muted' || raw === 'on') {
			return { ...DEFAULTS, musicVolume: raw === 'muted' ? 0 : 1 };
		}
		const parsed = JSON.parse(raw) as Partial<SoundSettings> & {
			muted?: boolean;
		};
		// A migrated `muted: true` collapses to zero music volume.
		const musicVolume = parsed.muted
			? 0
			: clampVolume(parsed.musicVolume, DEFAULTS.musicVolume);
		return {
			musicVolume,
			sfxVolume: clampVolume(parsed.sfxVolume, DEFAULTS.sfxVolume),
		};
	} catch {
		return { ...DEFAULTS };
	}
}

/** Writes the settings. Swallows failures (quota, private browsing). */
export function saveSoundSettings(settings: SoundSettings): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// localStorage unavailable — the settings simply won't survive a reload.
	}
}
