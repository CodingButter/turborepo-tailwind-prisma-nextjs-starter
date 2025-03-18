const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'jsdom',
	rootDir: '.',
	setupFiles: [path.resolve(__dirname, 'jest.setup.cjs')],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
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
	transformIgnorePatterns: ['/node_modules/(?!(@testing-library/jest-dom)/)'],
	moduleNameMapper: {
		'\\.(css|less|scss|sass)$': '<rootDir>/node_modules/jest-transform-stub',
		'^@repo/storage$': '<rootDir>/packages/storage/src/useStorage.ts',
		'^@repo/theme(.*)$': '<rootDir>/packages/theme/src$1',
		'^@repo/ui(.*)$': '<rootDir>/packages/ui/src$1',
		'^@repo/tirc(.*)$': '<rootDir>/packages/tirc/src$1',
		'^@/(.*)$': '<rootDir>/packages/theme/src/$1',
		'^@components/(.*)$': '<rootDir>/packages/theme/src/components/$1',
		'^@hooks/(.*)$': '<rootDir>/packages/theme/src/hooks/$1',
		'^@context/(.*)$': '<rootDir>/packages/theme/src/context/$1',
	},
	moduleDirectories: ['node_modules', '.'],
	testPathIgnorePatterns: ['/node_modules/'],
	verbose: true,
	globals: {
		'ts-jest': {
			useESM: true,
		},
	},
	extensionsToTreatAsEsm: ['.ts', '.tsx'],
};
