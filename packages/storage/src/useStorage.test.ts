// packages/storage/src/useStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useStorage } from './useStorage';
import '@testing-library/jest-dom';
import { jest, expect } from '@jest/globals';

beforeEach(() => {
	Object.defineProperty(global, 'localStorage', {
	  value: {
		getItem: jest.fn(),
		setItem: jest.fn(),
		clear: jest.fn(),
	  },
	  writable: true,
	});
  });

jest.mock('react', () => {
	const originalReact = jest.requireActual('react') as typeof import('react');

	return {
		__esModule: true,
		...originalReact,
	};
});

describe('useStorage', () => {
	beforeEach(() => {
		// Clear localStorage mock before each test
		jest.clearAllMocks();
	});

	it('should initialize with the provided value', () => {
		const { result } = renderHook(() => useStorage('test-value', 'test-key'));
		expect(result.current[0]).toBe('test-value');
	});

	it('should retrieve stored value from localStorage if available', () => {
		// Setup localStorage mock to return a value
		jest
			.spyOn(global.localStorage, 'getItem')
			.mockReturnValueOnce(JSON.stringify('stored-value'));

		const { result } = renderHook(() =>
			useStorage('default-value', 'test-key'),
		);
		expect(result.current[0]).toBe('stored-value');
	});

	it('should update localStorage when state changes', () => {
		const { result } = renderHook(() =>
			useStorage('initial-value', 'test-key'),
		);

		act(() => {
			result.current[1]('updated-value');
		});

		expect(global.localStorage.setItem).toHaveBeenCalledWith(
			'test-key',
			JSON.stringify('updated-value'),
		);
	});
});
