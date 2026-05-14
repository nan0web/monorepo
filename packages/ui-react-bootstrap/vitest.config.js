import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			react: resolve(__dirname, '../../node_modules/react'),
			'react-dom': resolve(__dirname, '../../node_modules/react-dom'),
		},
	},
	test: {
		environment: 'happy-dom',
		reporters: ['tap', 'verbose'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html', 'lcov'], // This will generate detailed reports
			include: ['src/**/*.{js,jsx,ts,tsx}'], // Include ALL source files
			exclude: [
				'src/**/*.test.{js,jsx,ts,tsx}', // Exclude test files
				'src/**/*.stories.{js,jsx,ts,tsx}', // Exclude stories
				'**/node_modules/**',
				'**/dist/**',
				'**/build/**',
				'vitest.setup.js',
			],
		},
		globals: true,
		include: [
			'src/**/*.test.jsx',
			'playground/**/*.test.jsx',
			'src/README.md.jsx',
			'releases/**/*.{spec,test}.jsx',
			'releases/**/*.{spec,test}.js',
		],
		setupFiles: ['./vitest.setup.js'],
		server: {
			deps: {
				inline: [/@nan0web/],
			},
		},
	},
})
