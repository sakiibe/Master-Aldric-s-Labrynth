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
	| 'failed';

export type MusicKey = 'overworld' | 'junction';

interface Clip {
	src: string;
	/** Per-clip gain 0..1. */
	volume: number;
}

/** One-shot event sounds. */
const SFX: Record<SfxKey, Clip> = {
	correct: { src: '/audio/correct.wav', volume: 0.9 },
	wrong: { src: '/audio/wrong.wav', volume: 0.9 },
	hint: { src: '/audio/hint.wav', volume: 0.8 },
	backtrack: { src: '/audio/backtrack.wav', volume: 0.7 },
	complete: { src: '/audio/complete.wav', volume: 1.0 },
	failed: { src: '/audio/failed.wav', volume: 0.95 },
};

/** Looping ambient beds, one per scene. */
const MUSIC: Record<MusicKey, Clip> = {
	overworld: { src: '/audio/music-overworld.mp3', volume: 0.5 },
	junction: { src: '/audio/music-junction.mp3', volume: 0.5 },
};

// ── Player ───────────────────────────────────────────────────────────────────

/**
 * Wraps HTMLAudioElement playback and holds the mute state. Not React-aware —
 * the provider drives it. Playback failures (missing file, autoplay block) are
 * swallowed so a silent clip never breaks the game.
 */
export class SoundPlayer {
	private muted: boolean;
	// The single looping music element, and the key it is playing.
	private musicEl: HTMLAudioElement | null = null;
	private musicKey: MusicKey | null = null;

	constructor(muted: boolean) {
		this.muted = muted;
	}

	setMuted(muted: boolean): void {
		this.muted = muted;
		if (this.musicEl) this.musicEl.muted = muted;
	}

	/** Fires a one-shot clip. A fresh element each call lets SFX overlap. */
	playSfx(key: SfxKey): void {
		if (this.muted) return;
		const clip = SFX[key];
		const el = new Audio(clip.src);
		el.volume = clip.volume;
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
		this.musicEl.muted = this.muted;

		if (key === null) {
			this.musicEl.pause();
			return;
		}
		const clip = MUSIC[key];
		this.musicEl.src = clip.src;
		this.musicEl.volume = clip.volume;
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
	muted: boolean;
	toggleMuted: () => void;
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
		}
	);
}
