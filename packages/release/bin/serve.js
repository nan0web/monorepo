#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { bootstrapApp } from '@nan0web/ui-cli'
import DBFS from '@nan0web/db-fs'
import { ServeCommand } from '../src/domain/ServeCommand.js'

function findMonorepoRoot(startDir) {
	let dir = resolve(startDir)
	const markers = ['pnpm-workspace.yaml', 'releases.txt']
	for (let i = 0; i < 10; i++) {
		for (const marker of markers) {
			if (existsSync(resolve(dir, marker))) {
				return dir
			}
		}
		const parent = dirname(dir)
		if (parent === dir) break
		dir = parent
	}
	return startDir
}

const startCwd = process.env.INIT_CWD || process.cwd()
process.env.RELEASE_CWD = startCwd
const root = findMonorepoRoot(startCwd)
if (process.cwd() !== root && existsSync(resolve(root, 'releases.txt'))) {
	process.chdir(root)
}

const db = new DBFS()
await db.connect()

const res = await bootstrapApp(ServeCommand, { db, noExit: true }).catch((err) => {
	console.error(err)
	process.exit(1)
})

const resultIntent = res?.data || {}
const data = resultIntent?.data || resultIntent || {}
if (data.success && data.html) {
	try {
		const { createServer } = await import('node:http')
		const port = data.port || 3131
		const server = createServer((req, resHttp) => {
			resHttp.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
			resHttp.end(data.html)
		})

		server.listen(port, () => {
			if (data.open) {
				import('node:child_process')
					.then(({ exec }) => exec(`open http://localhost:${port}`))
					.catch(() => {})
			}
		})

		const stopServer = () => {
			server.close(() => {
				process.exit(0)
			})
		}

		process.on('SIGINT', stopServer)
		process.on('SIGTERM', stopServer)
	} catch (err) {
		console.error(`Failed to start HTTP server: ${err.message}`)
		process.exit(1)
	}
} else if (data.success === false) {
	process.exit(1)
}

