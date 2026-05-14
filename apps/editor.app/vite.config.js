import { defineConfig } from 'vite'

export default defineConfig({
	root: './',
	base: './',
	resolve: {
		preserveSymlinks: true,
		alias: {
			'@nan0web/editor': '/Users/i/src/nan.web/packages/editor/src/core/index.js',
			'@nan0web/db-browser': '/Users/i/src/nan.web/packages/db-browser/src/index.js',
			'@nan0web/db': '/Users/i/src/nan.web/packages/db/src/index.js',
			'@nan0web/ui-lit': '/Users/i/src/nan.web/packages/ui-lit/src/index.js',
		},
	},
	server: {
		port: 4246,
		strictPort: true,
	},
	build: {
		outDir: 'dist',
		emptyOutDir: true,
	},
})
