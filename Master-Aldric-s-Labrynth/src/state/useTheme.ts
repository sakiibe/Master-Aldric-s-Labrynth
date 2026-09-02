/**
 * The theme context and its hook, kept apart from the ThemeProvider component
 * so each file exports only one kind of thing — components live in
 * ThemeContext.tsx, this holds the context object and hook. Fast Refresh
 * (react-refresh/only-export-components) requires a component file to export
 * nothing but components.
 */

import { createContext, useContext } from 'react';
import type { ThemeTokens } from '../game/types';
import { theme } from '../game/theme';

export const ThemeContext = createContext<ThemeTokens>(theme);

export function useTheme(): ThemeTokens {
	return useContext(ThemeContext);
}
