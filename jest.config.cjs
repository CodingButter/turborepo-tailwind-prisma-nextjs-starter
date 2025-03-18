/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	rootDir: '.',
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				tsconfig: './packages/typescript-config/react-library.json',
				babelConfig: true,
				isolatedModules: true,
			},
		],
	},
	moduleNameMapper: {
		// Mock CSS imports
		'\\.(css|less|scss|sass)$': '<rootDir>/node_modules/jest-transform-stub',
		// Package imports - be more specific with the patterns
		'^@repo/storage$': '<rootDir>/packages/storage/src/useStorage.ts',
		'^@repo/theme(.*)$': '<rootDir>/packages/theme/src$1',
		'^@repo/ui(.*)$': '<rootDir>/packages/ui/src$1',
		'^@repo/tirc(.*)$': '<rootDir>/packages/tirc/src$1',
		// Theme package path aliases
		'^@/(.*)$': '<rootDir>/packages/theme/src/$1',
		'^@components/(.*)$': '<rootDir>/packages/theme/src/components/$1',
		'^@hooks/(.*)$': '<rootDir>/packages/theme/src/hooks/$1',
		'^@context/(.*)$': '<rootDir>/packages/theme/src/context/$1',
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
	moduleDirectories: ['node_modules', '.'],
	testPathIgnorePatterns: ['/node_modules/'],
	verbose: true,
};
