#!/usr/bin/env node

/**
 * search-workspace.js — OLMUI runner.
 * CLI Adapter for workspace semantic search. All logic lives in SearchSourcesIntent.
 */
import { SearchSourcesIntent } from '../src/domain/SearchSourcesIntent.js'
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
console.log('Search Workspace Root detected (via pnpm-workspace.yaml):', root)

bootstrapApp(SearchSourcesIntent, {
	workspaceRoot: root,
	dataDir: root
})
