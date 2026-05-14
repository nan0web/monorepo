import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
	root: path.resolve(import.meta.dirname, '..'),
	server: {
		port: 4260,
	},
})
