/**
 * The reduce-motion context and its hook, kept apart from the MotionProvider
 * component so each file exports only one kind of thing (react-refresh/
 * only-export-components) — mirroring the ThemeContext.tsx / useTheme.ts split.
 */

import { createContext, useContext } from 'react';

export interface MotionApi {
	/** True when ambient animation should hold still. */
	reduceMotion: boolean;
	setReduceMotion: (reduce: boolean) => void;
}

export const MotionContext = createContext<MotionApi | null>(null);

/** Access the motion preference. Falls back to no-op outside a provider. */
export function useMotion(): MotionApi {
	const ctx = useContext(MotionContext);
	return ctx ?? { reduceMotion: false, setReduceMotion: () => {} };
}
