/**
 * The sound layer's logic: a manifest of every clip, a small
 * HTMLAudioElement-based player, the context object, and the `useSound` hook.
 * The provider component lives in ./SoundProvider so this file exports no
 * components (react-refresh/only-export-components) — mirroring the
 * useTheme.ts / ThemeContext.tsx split.
 *
 * Design rules:
 * - A missing file is silent, never a crash. The game runs today with an empty
 *   public/audio/ and gains sound the moment real files are dropped in.
 * - SFX are one-shot and may overlap; music is a single looping bed swapped per
 *   scene.
 * - Browsers block audio until the first user gesture, so music requested
 *   before then starts on that first interaction.
 */

import { createContext, useContext } from 'react';

// ── Manifest ────────────────────────────────────────────────────────────────

export type SfxKey =
	| 'correct'
	| 'wrong'
	| 'hint'
	| 'backtrack'
	| 'complete'
	| 'failed'
	| 'click';

export type MusicKey = 'menu' | 'overworld' | 'junction';

interface Clip {
	src: string;
	/** Per-clip gain 0..1. */
	volume: number;
}

/** One-shot event sounds. */
const SFX: Record<SfxKey, Clip> = {
	correct: { src: '/audio/sfx/correct.wav', volume: 0.9 },
	wrong: { src: '/audio/sfx/wrong.wav', volume: 0.9 },
	hint: { src: '/audio/sfx/hint.wav', volume: 0.8 },
	backtrack: { src: '/audio/sfx/backtrack.wav', volume: 0.7 },
	complete: { src: '/audio/sfx/complete.wav', volume: 1.0 },
	failed: { src: '/audio/sfx/failed.wav', volume: 0.95 },
	click: { src: '/audio/sfx/click.wav', volume: 0.6 },
};

/** Looping ambient beds, one per scene. */
const MUSIC: Record<MusicKey, Clip> = {
	menu: { src: '/audio/music/music-menu.mp3', volume: 0.5 },
	overworld: { src: '/audio/music/music-overworld.mp3', volume: 0.5 },
	junction: { src: '/audio/music/music-junction.mp3', volume: 0.5 },
};

// ── Player ───────────────────────────────────────────────────────────────────

/**
 * Wraps HTMLAudioElement playback and holds the mute state. Not React-aware —
 * the provider drives it. Playback failures (missing file, autoplay block) are
 * swallowed so a silent clip never breaks the game.
 */
export class SoundPlayer {
	// Master gains, 0..1, multiplied onto each clip's own gain. Music at zero is
	// the "muted" state; SFX is independent and never touched by the mute button.
	private musicVolume: number;
	private sfxVolume: number;
	// The single looping music element, and the key it is playing.
	private musicEl: HTMLAudioElement | null = null;
	private musicKey: MusicKey | null = null;

	constructor(musicVolume: number, sfxVolume: number) {
		this.musicVolume = musicVolume;
		this.sfxVolume = sfxVolume;
	}

	/** Sets the master music gain and reapplies it to any playing bed. */
	setMusicVolume(volume: number): void {
		this.musicVolume = volume;
		if (this.musicEl && this.musicKey !== null) {
			this.musicEl.volume = MUSIC[this.musicKey].volume * volume;
		}
	}

	/** Sets the master SFX gain. Applied to clips fired after this call. */
	setSfxVolume(volume: number): void {
		this.sfxVolume = volume;
	}

	/** Fires a one-shot clip. A fresh element each call lets SFX overlap. */
	playSfx(key: SfxKey): void {
		if (this.sfxVolume === 0) return;
		const clip = SFX[key];
		const el = new Audio(clip.src);
		el.volume = clip.volume * this.sfxVolume;
		void el.play().catch(() => {});
	}

	/**
	 * Swaps the looping music bed. Passing the current key is a no-op so the
	 * track does not restart on re-render; null stops music entirely.
	 */
	playMusic(key: MusicKey | null): void {
		if (key === this.musicKey) return;
		this.musicKey = key;

		if (!this.musicEl) {
			this.musicEl = new Audio();
			this.musicEl.loop = true;
		}

		if (key === null) {
			this.musicEl.pause();
			return;
		}
		const clip = MUSIC[key];
		this.musicEl.src = clip.src;
		this.musicEl.volume = clip.volume * this.musicVolume;
		void this.musicEl.play().catch(() => {});
	}

	/** Re-attempts blocked music playback — called on the first user gesture. */
	resume(): void {
		if (this.musicEl && this.musicEl.paused && this.musicKey !== null) {
			void this.musicEl.play().catch(() => {});
		}
	}
}

// ── Context + hook ────────────────────────────────────────────────────────────

export interface SoundApi {
	playSfx: (key: SfxKey) => void;
	playMusic: (key: MusicKey | null) => void;
	/** True when music is silenced (music volume is zero). Music-only. */
	muted: boolean;
	/** Toggles music between zero and the last non-zero level. */
	toggleMuted: () => void;
	/** Master music gain, 0..1. Zero is the muted state. */
	musicVolume: number;
	setMusicVolume: (volume: number) => void;
	/** Master SFX gain, 0..1. */
	sfxVolume: number;
	setSfxVolume: (volume: number) => void;
}

export const SoundContext = createContext<SoundApi | null>(null);

/** Access the sound API. Falls back to a silent no-op outside a provider. */
export function useSound(): SoundApi {
	const ctx = useContext(SoundContext);
	return (
		ctx ?? {
			playSfx: () => {},
			playMusic: () => {},
			muted: false,
			toggleMuted: () => {},
			musicVolume: 1,
			setMusicVolume: () => {},
			sfxVolume: 1,
			setSfxVolume: () => {},
		}
	);
}
