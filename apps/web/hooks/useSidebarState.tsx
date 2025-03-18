'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to manage sidebar collapsed state with localStorage persistence
 */
export const useSidebarState = (
	initialState = false,
): [boolean, (value: boolean) => void] => {
	// Initialize state from a function to avoid localStorage access during SSR
	const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
		// Only access localStorage on the client side
		if (typeof window === 'undefined') {
			return initialState;
		}

		try {
			const stored = localStorage.getItem('sidebar-collapsed');
			return stored !== null ? JSON.parse(stored) : initialState;
		} catch (error) {
			console.error('Error reading sidebar state from localStorage:', error);
			return initialState;
		}
	});

	// Update localStorage when state changes - but only on client side
	useEffect(() => {
		try {
			if (typeof window !== 'undefined') {
				localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
			}
		} catch (error) {
			console.error('Error saving sidebar state to localStorage:', error);
		}
	}, [isCollapsed]);

	return [isCollapsed, setIsCollapsed];
};

export default useSidebarState;
