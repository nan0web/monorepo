import { build } from 'esbuild'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

await build({
	entryPoints: [resolve(__dirname, 'index.js')],
	bundle: true,
	outfile: resolve(__dirname, 'dist/extension.js'),
	external: ['vscode'],
	format: 'cjs',
	platform: 'node',
	target: 'node18',
	minify: true,
	sourcemap: true,
})

console.log('✅ VS Code extension built → dist/extension.js')
