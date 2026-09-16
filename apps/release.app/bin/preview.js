#!/usr/bin/env node
/**
 * @file Generate static HTML dashboard for browser manual review.
 * Automatically resolves monorepo root.
 */
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import DBFS from '@nan0web/db-fs'
import { DashboardModel } from '@nan0web/release'
import { ReleaseDashboard } from '../src/ui/web/ReleaseDashboard.js'

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

const dashboardModel = new DashboardModel({ registryFile: 'releases.txt' }, { db })
const { summary, projects } = await dashboardModel.aggregate()

const dashboard = new ReleaseDashboard({ summary, projects })
const html = dashboard.render()

await db.saveDocument('apps/release.app/play/index.html', html)
console.log('✨ Web Dashboard успішно згенеровано у: apps/release.app/play/index.html')
