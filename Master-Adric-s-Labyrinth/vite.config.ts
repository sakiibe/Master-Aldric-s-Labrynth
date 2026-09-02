import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'node', // engine/ is pure — no jsdom needed yet
		include: ['src/**/*.test.ts'],
	},
});
