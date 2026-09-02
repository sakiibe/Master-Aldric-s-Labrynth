/**
 * Makes the apothecary theme available to ui/ without ui/ importing
 * game/theme.ts directly. Alchemy is the only theme, so there is nothing to
 * choose between yet — this exists so that could change without a sweep
 * through every scene.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { ThemeTokens } from '../game/types';
import { theme } from '../game/theme';

const ThemeContext = createContext<ThemeTokens>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const vars = {
		'--color-bg': theme.colors.bg,
		'--color-surface': theme.colors.surface,
		'--color-ink': theme.colors.ink,
		'--color-ink-muted': theme.colors.inkMuted,
		'--color-accent': theme.colors.accent,
		'--color-correct': theme.colors.correct,
		'--color-wrong': theme.colors.wrong,
		'--color-locked': theme.colors.locked,
		'--color-cleared': theme.colors.cleared,
		'--font-display': theme.fonts.display,
		'--font-body': theme.fonts.body,
		'--font-ui': theme.fonts.ui,
	} as React.CSSProperties;

	return (
		<ThemeContext.Provider value={theme}>
			<div className="theme-root" style={vars}>
				{children}
			</div>
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeTokens {
	return useContext(ThemeContext);
}
