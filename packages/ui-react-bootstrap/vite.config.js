import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Directory } from '@nan0web/db'
import FS from '@nan0web/db-fs'
import { nan0webVitePlugin } from '@nan0web/ui-react/vite'

class JSONDirectory extends Directory {
	static DATA_EXTNAMES = ['.json']
}
class JSONFS extends FS {
	static Directory = JSONDirectory
}

const input = new FS({ root: 'data' })
const output = new JSONFS({ root: 'dist' })

export default defineConfig({
	base: '/',
	globals: true,
	environment: 'jsdom',
	// root: './play',
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
				silenceDeprecations: [
					'import',
					'color-functions',
					'legacy-js-api',
					'global-builtin',
					'if-function',
				],
			},
		},
	},
	publicDir: 'public',
	plugins: [
		react(),
		nan0webVitePlugin({
			input,
			output,
		}),
	],
	build: {
		outDir: '../dist/',
		onwarn: (_, handler) => {
			process.env.BUILD_COMMAND = 'vite-build'
			handler()
		},
	},
})
