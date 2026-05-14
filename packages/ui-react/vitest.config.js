import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'happy-dom',
		globals: true,
		include: ['src/**/*.test.jsx', 'src/README.md.jsx'],
		setupFiles: ['./vitest.setup.js'],
	},
})
