#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { bootstrapApp } from '@nan0web/ui-cli'
import DBFS from '@nan0web/db-fs'
import { ReleaseApp } from '../src/domain/App.js'

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

bootstrapApp(ReleaseApp, { db }).catch((err) => {
	console.error(err)
	process.exit(1)
})
