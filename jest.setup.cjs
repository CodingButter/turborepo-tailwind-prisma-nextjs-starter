// Use require instead of import
require('@testing-library/jest-dom');

// Mock window.matchMedia for theme media queries
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
});

// Mock localStorage for storage hooks
const store = {};
const localStorageMock = {
	getItem: jest.fn((key) => store[key] || null),
	setItem: jest.fn((key, value) => {
		store[key] = String(value);
	}),
	removeItem: jest.fn((key) => {
		delete store[key];
	}),
	clear: jest.fn(() => {
		Object.keys(store).forEach((key) => {
			delete store[key];
		});
	}),
	length: 0,
	key: jest.fn((index) => null),
};

Object.defineProperty(window, 'localStorage', {
	value: localStorageMock,
});

// Suppress React 19 + testing-library version mismatch warnings
jest.spyOn(console, 'error').mockImplementation((message) => {
	if (
		message &&
		typeof message === 'string' &&
		(message.includes('ReactDOM.render') || message.includes('React 18'))
	) {
		return;
	}
	// eslint-disable-next-line no-console
	console.error(message);
});
