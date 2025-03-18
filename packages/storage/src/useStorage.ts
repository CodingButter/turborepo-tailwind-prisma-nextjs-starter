import { useState, useEffect, useMemo } from 'react';

/**
 * A custom hook that works like useState but persists the data in localStorage.
 * @param initialValue The initial value to use if no stored value exists
 * @param customKey Optional custom key for localStorage. If not provided, a unique key will be generated
 * @returns A stateful value and a function to update it, just like useState
 */
export function useStorage<T>(
	initialValue: T,
	customKey?: string,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	// Create a unique key if none is provided
	const key = useMemo(() => {
		if (customKey) return customKey;
		// Generate a key based on the initial value and call stack
		const errorStack = new Error().stack || '';
		const callSiteHash = errorStack
			.split('\n')
			.slice(2, 3)
			.join('')
			.trim()
			.replace(/[^a-zA-Z0-9]/g, '_');

		// Create a hash of the initial value
		const valueType = typeof initialValue;
		const valueStr =
			valueType === 'object'
				? JSON.stringify(initialValue)
				: String(initialValue);
		const valueHash = valueStr
			.split('')
			.reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
			.toString(36);

		return `storage_${callSiteHash}_${valueHash}`;
	}, [customKey, initialValue]); // Added initialValue to dependency array

	// Initialize state with stored value or initial value
	const [state, setState] = useState<T>(() => {
		// Only access localStorage on the client side
		if (typeof window === 'undefined') {
			return initialValue;
		}

		try {
			const item = localStorage.getItem(key);
			// Return parsed stored value if exists, otherwise the initial value
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error('Error reading from localStorage:', error);
			return initialValue;
		}
	});

	// Update localStorage when state changes
	useEffect(() => {
		try {
			// Only update localStorage on client
			if (typeof window !== 'undefined') {
				if (state === undefined) {
					localStorage.removeItem(key);
				} else {
					localStorage.setItem(key, JSON.stringify(state));
				}
			}
		} catch (error) {
			console.error('Error writing to localStorage:', error);
		}
	}, [key, state]);

	return [state, setState];
}
