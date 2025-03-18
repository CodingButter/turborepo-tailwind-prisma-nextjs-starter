import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useTheme, ThemeContext, ThemeMode } from './useTheme';

// Test component that uses the hook
const TestComponent = () => {
	const { theme, setTheme } = useTheme();

	return (
		<div>
			<div data-testid="current-theme">{theme}</div>
			<button onClick={() => setTheme && setTheme('light')}>Set Light</button>
			<button onClick={() => setTheme && setTheme('dark')}>Set Dark</button>
		</div>
	);
};

// Wrapper with ThemeContext
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
	const [theme, setTheme] = React.useState<ThemeMode>('dark');

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

describe('useTheme', () => {
	test('returns the current theme from context', () => {
		render(
			<ThemeWrapper>
				<TestComponent />
			</ThemeWrapper>,
		);

		expect(screen.getByTestId('current-theme').textContent).toBe('dark');
	});

	test('updates theme when setTheme is called', () => {
		render(
			<ThemeWrapper>
				<TestComponent />
			</ThemeWrapper>,
		);

		expect(screen.getByTestId('current-theme').textContent).toBe('dark');

		act(() => {
			screen.getByText('Set Light').click();
		});

		expect(screen.getByTestId('current-theme').textContent).toBe('light');
	});

	test('throws error when used outside ThemeProvider', () => {
		// Suppress console.error for this test
		const originalError = console.error;
		console.error = jest.fn();

		expect(() => {
			render(<TestComponent />);
		}).toThrow('useTheme must be used within a ThemeProvider');

		// Restore console.error
		console.error = originalError;
	});
});
