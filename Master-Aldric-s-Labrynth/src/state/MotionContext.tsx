/**
 * Owns the reduce-motion preference and applies it at the top level: the flag
 * is reflected onto <html> as `data-reduce-motion`, which a single global CSS
 * rule (ui/styles/game.css) uses to halt every animation and transition on the
 * page. Individual scenes therefore no longer gate their own ambient
 * animations — they animate freely and this switch stops them all at once.
 *
 * The context object and `useMotion` hook live in ./useMotion so this file
 * exports only a component (react-refresh/only-export-components).
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadReduceMotion, saveReduceMotion } from './motionStorage';
import { MotionContext, type MotionApi } from './useMotion';

export function MotionProvider({ children }: { children: ReactNode }) {
	const [reduceMotion, setReduceMotion] = useState(loadReduceMotion);

	// Reflect the flag onto <html> and persist it whenever it changes.
	useEffect(() => {
		document.documentElement.dataset.reduceMotion = reduceMotion
			? 'true'
			: 'false';
		saveReduceMotion(reduceMotion);
	}, [reduceMotion]);

	const api = useMemo<MotionApi>(
		() => ({ reduceMotion, setReduceMotion }),
		[reduceMotion],
	);

	return (
		<MotionContext.Provider value={api}>{children}</MotionContext.Provider>
	);
}
