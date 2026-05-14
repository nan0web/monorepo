import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { cpSync, mkdirSync, existsSync, createReadStream } from 'node:fs'

export default defineConfig({
	root: '.',
	base: '/packages/ui-react/',
	build: {
		outDir: 'dist/web',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(import.meta.dirname, 'docs/index.html'),
				uk: resolve(import.meta.dirname, 'docs/uk/index.html'),
				en: resolve(import.meta.dirname, 'docs/en/index.html'),
			},
		},
	},
	server: {
		port: 4247,
	},
	plugins: [
		{
			name: 'copy-docs',
			writeBundle() {
				mkdirSync('dist/web/docs/uk', { recursive: true })
				if (existsSync('docs/uk/README.md')) {
					cpSync('docs/uk/README.md', 'dist/web/docs/uk/README.md')
				}
				if (existsSync('README.md')) {
					cpSync('README.md', 'dist/web/README.md')
				}
				if (existsSync('docs/data')) {
					cpSync('docs/data', 'dist/web/docs/data', { recursive: true })
				}
			},
			configureServer(server) {
				server.middlewares.use('/packages/ui-react/docs', (req, res, next) => {
					const filePath = resolve('docs', req.url.slice(1))
					if (!existsSync(filePath)) return next()
					res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
					createReadStream(filePath).pipe(res)
				})
			},
		},
	],
})
