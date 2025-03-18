import { Sun, Moon, Palette } from 'lucide-react';

export type ThemeMode =
	| 'light'
	| 'dark'
	| 'purple'
	| 'blue'
	| 'green'
	| 'midnight';
export type BaseTheme = 'light' | 'dark';

export const themes: {
	value: ThemeMode;
	label: string;
	icon?: React.ReactNode;
}[] = [
	{ value: 'light', label: 'Light', icon: <Sun size={16} /> },
	{ value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
	{
		value: 'purple',
		label: 'Purple',
		icon: <Palette className="text-[var(--icon-purple)]" size={16} />,
	},
	{
		value: 'blue',
		label: 'Blue',
		icon: <Palette className="text-[var(--icon-blue)]" size={16} />,
	},
	{
		value: 'green',
		label: 'Green',
		icon: <Palette className="text-[var(--icon-green)]" size={16} />,
	},
	{
		value: 'midnight',
		label: 'Midnight',
		icon: <Palette className="text-[var(--icon-midnight)]" size={16} />,
	},
];

/**
 * Theme configuration structure
 */
export interface ThemeConfig {
	name: ThemeMode;
	label: string;
	baseTheme: BaseTheme;
	variables: Record<string, string>;
}

/**
 * Color variables available in themes
 */
export interface ThemeColors {
	// Primary colors
	primary: string;
	'primary-light': string;
	'primary-dark': string;

	// Secondary colors
	secondary: string;
	'secondary-light': string;
	'secondary-dark': string;

	// Accent colors
	accent: string;
	'accent-light': string;
	'accent-dark': string;

	// Background colors
	background: string;
	'background-secondary': string;
	'background-tertiary': string;

	// Surface colors
	surface: string;
	'surface-hover': string;

	// Border colors
	border: string;
	'border-light': string;

	// Text colors
	text: string;
	'text-secondary': string;
	'text-tertiary': string;

	// Status colors
	success: string;
	error: string;
	warning: string;
	info: string;

	// Component-specific colors
	'chat-self': string;
	'chat-mention': string;
	'chat-system': string;
}

/**
 * Theme context value structure
 */
export interface ThemeContextValue {
	theme: ThemeMode;
	setTheme: (theme: ThemeMode) => void;
}
