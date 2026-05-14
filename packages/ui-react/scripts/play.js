#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { writeFileSync, existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * NanoPlay — Node.js Environment Adapter for PlaygroundModel.
 *
 * This is a THIN infrastructure layer. Business logic lives in PlaygroundModel.
 * Usage: node scripts/play.js [port] [stateFile] [...viteArgs]
 */

const port = process.argv[2] || '4246'
const stateFile = resolve(process.argv[3] || '.port')
const extraArgs = process.argv.slice(4)

// Cleanup previous state
if (existsSync(stateFile)) rmSync(stateFile)

// Start Vite with port preference
const args = ['vite', '--port', port, ...extraArgs]
const vite = spawn('npx', args, { stdio: ['inherit', 'pipe', 'inherit'], shell: true })

vite.stdout.on('data', (chunk) => {
	const text = chunk.toString()
	process.stdout.write(text)

	const match = text.match(/http:\/\/localhost:(\d+)\//)
	if (match) {
		writeFileSync(stateFile, match[1])
		const isDocs = extraArgs.join(' ').includes('docs')
		const label = isDocs ? 'Docs' : 'Playground'
		const sub = isDocs ? 'packages/ui-react/docs/' : 'play/'
		console.log(`\n\x1b[1;32m🚀 ${label}: http://localhost:${match[1]}/${sub}\x1b[0m`)
	}
})

const cleanup = () => {
	existsSync(stateFile) && rmSync(stateFile)
	vite.kill()
	process.exit()
}
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
vite.on('exit', () => existsSync(stateFile) && rmSync(stateFile))
