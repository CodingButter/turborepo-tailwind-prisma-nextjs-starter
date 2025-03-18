import { createContext, useContext } from 'react';
import { ThemeContextValue } from '../../types/Themes';

// Create context with default values
export const ThemeContext = createContext<ThemeContextValue | undefined>(
	undefined,
);

// Custom hook to use the theme context
export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
