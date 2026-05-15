#!/usr/bin/env node

/**
 * index-workspace.js — OLMUI runner. 
 * CLI Adapter for workspace indexing. All logic lives in IndexWorkspaceApp.
 */
import { IndexWorkspaceApp } from '../src/domain/IndexWorkspaceApp.js'
import { bootstrapApp } from '@nan0web/ui-cli'

import fs from 'node:fs'
import path from 'node:path'

let root = process.cwd()
while (root && root !== '/') {
	if (fs.existsSync(path.join(root, 'pnpm-workspace.yaml'))) break
	const parent = path.dirname(root)
	if (parent === root) break
	root = parent
}
console.log('Indexer Workspace Root detected (via pnpm-workspace.yaml):', root)

bootstrapApp(IndexWorkspaceApp, {
	workspaceRoot: root,
	dataDir: root
})
