#!/usr/bin/env node
/**
 * @file Entry point for ReleaseApp CLI.
 * Automatically resolves monorepo root by walking up the directory tree
 * looking for pnpm-workspace.yaml (or releases.txt).
 */
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { bootstrapApp } from '@nan0web/ui-cli'
import DBFS from '@nan0web/db-fs'
import { ReleaseApp } from '../src/domain/app/ReleaseApp.js'

/**
 * Walk up from startDir looking for a marker file that indicates the monorepo root.
 * @param {string} startDir
 * @returns {string}
 */
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
const root = findMonorepoRoot(startCwd)
process.chdir(root)

const db = new DBFS()
await db.connect()

bootstrapApp(ReleaseApp, { db }).catch((err) => {
	console.error(err)
	process.exit(1)
})
