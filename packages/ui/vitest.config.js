import process from 'node:process'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		sourcemap: true,
		environment: 'node',
		cache: false,
		root: process.cwd(),
		coverage: {
			provider: 'v8',
		},
		exclude: ['apps/**', 'node_modules/**'],
		isolate: false,
		// Try to force inline source maps for best debugging
		// (Vite will use inline source maps for dev by default)
	},
	resolve: {
		alias: {
			'@': '/src',
		},
	},
})
