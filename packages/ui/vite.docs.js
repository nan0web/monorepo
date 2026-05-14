import { defineConfig } from 'vite'
import yaml from '@rollup/plugin-yaml'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [yaml()],
	build: {
		outDir: 'dist',
		lib: {
			entry: path.resolve(__dirname, 'src/index.js'),
			name: 'Nan0UI',
			fileName: 'ui',
			formats: ['es'],
		},
		rollupOptions: {
			external: ['lit', '@nan0web/types', '@nan0web/core'],
		}
	},
})
