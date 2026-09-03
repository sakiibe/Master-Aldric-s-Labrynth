/**
 * Owns the SoundPlayer instance, exposes it through context, and bridges React
 * state to it: mute changes are pushed to the player and persisted, and the
 * first user gesture resumes any music the browser blocked on load.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { loadMuted, saveMuted } from '../state/soundStorage';
import { SoundContext, SoundPlayer, type SoundApi } from './useSound';

export function SoundProvider({ children }: { children: ReactNode }) {
	const [muted, setMuted] = useState(loadMuted);
	const playerRef = useRef<SoundPlayer | null>(null);
	if (playerRef.current === null) {
		playerRef.current = new SoundPlayer(muted);
	}

	// Push mute changes to the player and persist them.
	useEffect(() => {
		playerRef.current?.setMuted(muted);
		saveMuted(muted);
	}, [muted]);

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
			toggleMuted: () => setMuted((m) => !m),
		}),
		[muted],
	);

	return <SoundContext.Provider value={api}>{children}</SoundContext.Provider>;
}
