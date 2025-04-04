export default {
	testEnvironment: 'jsdom',
	preset: 'ts-jest/presets/default-esm',
	extensionsToTreatAsEsm: ['.ts', '.tsx'],
	setupFilesAfterEnv: ['@testing-library/jest-dom'],
	transform: {
		'^.+\\.(ts|tsx)$': [
			'ts-jest',
			{
				useESM: true,
				tsconfig: './packages/typescript-config/react-library.json',
			},
		],
	},
	moduleNameMapper: {
		'^@repo/(.*)$': '<rootDir>/packages/$1/src',
		'\\.(css|less|scss|sass)$': 'jest-transform-stub',
	},
	transformIgnorePatterns: ['/node_modules/(?!(@testing-library/jest-dom)/)'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
	testEnvironment: 'jsdom',
};
