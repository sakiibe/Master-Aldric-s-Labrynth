/**
 * Owns the SoundPlayer instance, exposes it through context, and bridges React
 * state to it: volume changes are pushed to the player and persisted, and the
 * first user gesture resumes any music the browser blocked on load.
 *
 * Muting is not a separate flag — it is the music volume at zero. The corner
 * mute button and the music slider therefore share one value: dragging the
 * slider to zero shows the button as muted, and the button toggles the music
 * between zero and the last non-zero level (remembered for the session). SFX
 * volume is wholly independent, so muting never silences sound effects.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadSoundSettings, saveSoundSettings } from '../state/soundStorage';
import { SoundContext, SoundPlayer, type SoundApi } from './useSound';

export function SoundProvider({ children }: { children: ReactNode }) {
	// One object holds both volumes; the setters below patch a field.
	const [settings, setSettings] = useState(loadSoundSettings);
	const { musicVolume, sfxVolume } = settings;
	const muted = musicVolume === 0;

	// The level to restore when unmuting. Seeded so an initial muted state
	// (music volume persisted as zero) still unmutes to a sensible level.
	const lastMusicVolumeRef = useRef(musicVolume === 0 ? 1 : musicVolume);

	const playerRef = useRef<SoundPlayer | null>(null);
	if (playerRef.current === null) {
		playerRef.current = new SoundPlayer(musicVolume, sfxVolume);
	}

	// Remember the last audible music level for the unmute restore.
	useEffect(() => {
		if (musicVolume > 0) lastMusicVolumeRef.current = musicVolume;
	}, [musicVolume]);

	// Push both volumes to the player and persist them on any change.
	useEffect(() => {
		const player = playerRef.current;
		if (!player) return;
		player.setMusicVolume(musicVolume);
		player.setSfxVolume(sfxVolume);
		saveSoundSettings(settings);
	}, [settings, musicVolume, sfxVolume]);

	// Browsers block audio until a user gesture — resume music on the first one.
	useEffect(() => {
		const resume = () => playerRef.current?.resume();
		window.addEventListener('pointerdown', resume, { once: true });
		window.addEventListener('keydown', resume, { once: true });
		return () => {
			window.removeEventListener('pointerdown', resume);
			window.removeEventListener('keydown', resume);
		};
	}, []);

	const api = useMemo<SoundApi>(
		() => ({
			playSfx: (key) => playerRef.current?.playSfx(key),
			playMusic: (key) => playerRef.current?.playMusic(key),
			muted,
			// Mute drops music to zero; unmute restores the last audible level.
			toggleMuted: () =>
				setSettings((s) => ({
					...s,
					musicVolume: s.musicVolume === 0 ? lastMusicVolumeRef.current : 0,
				})),
			musicVolume,
			setMusicVolume: (v) => setSettings((s) => ({ ...s, musicVolume: v })),
			sfxVolume,
			setSfxVolume: (v) => setSettings((s) => ({ ...s, sfxVolume: v })),
		}),
		[muted, musicVolume, sfxVolume],
	);

	return <SoundContext.Provider value={api}>{children}</SoundContext.Provider>;
}
