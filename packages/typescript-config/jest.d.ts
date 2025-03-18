// packages/typescript-config/jest.d.ts
import '@testing-library/jest-dom';
import { expect, jest, describe, it, test } from '@jest/globals';

// Extend the global Jest expect with additional matchers
declare global {
	namespace jest {
		interface Expect {
			extend(matchers: { [key: string]: any }): void;
		}

		interface Matchers<R = any> {
			toBeInTheDocument(): R;
			toHaveTextContent(text: string): R;
			toHaveAttribute(attr: string, value?: string): R;
			toHaveClass(className: string): R;
			toBeVisible(): R;
			toBeDisabled(): R;
			toBeEnabled(): R;
			toBeChecked(): R;
		}
	}
}

// Export to ensure module augmentation
export {};
