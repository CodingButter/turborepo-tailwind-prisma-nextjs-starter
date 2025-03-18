// packages/storage/src/useStorage.test.ts
import { renderHook, act } from '@testing-library/react';
import { useStorage } from './useStorage';

jest.mock('react', () => {
	const originalReact = jest.requireActual('react');

	return {
		...originalReact,
		useState: jest.fn().mockImplementation((initialValue) => {
			// Use mockPrefix to avoid Jest error
			const mockSetState = jest.fn();
			return [initialValue, mockSetState];
		}),
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
