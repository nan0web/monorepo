/**
 * Script to switch @industrialbank apps between Workspace (Monorepo) and NPM (Standalone) modes.
 * Usage: node scripts/bank-switch-npm.js [workspace|npm] [version]
 * Example: node scripts/bank-switch-npm.js npm 1.1.0
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '../apps/@/industrialbank')

const MODE = process.argv[2] || 'npm' // 'workspace' or 'npm'
const VERSION = process.argv[3] || 'latest' // e.g. '1.1.0' or 'latest' or '^1.2.0'

// Only touch @nan0web packages
const SCOPE = '@nan0web/'

function updatePackageJson(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8')
	const pkg = JSON.parse(content)
	let changed = false

	const processDeps = (deps) => {
		if (!deps) return
		for (const [key, val] of Object.entries(deps)) {
			if (key.startsWith(SCOPE)) {
				let newVal = val
				if (MODE === 'workspace') {
					if (val !== 'workspace:*') {
						newVal = 'workspace:*'
					}
				} else {
					// NPM mode
					if (val === 'workspace:*' || val.startsWith('link:')) {
						newVal = VERSION === 'latest' ? 'latest' : `^${VERSION}`
					}
				}

				if (newVal !== val) {
					deps[key] = newVal
					changed = true
					console.log(`[${pkg.name}] Updated ${key}: ${val} -> ${newVal}`)
				}
			}
		}
	}

	processDeps(pkg.dependencies)
	processDeps(pkg.devDependencies)
	processDeps(pkg.peerDependencies)

	if (changed) {
		fs.writeFileSync(filePath, JSON.stringify(pkg, null, '\t') + '\n')
		console.log(`Saved ${filePath}`)
	}
}

function processDir(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true })
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)
		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name === '.git') continue
			processDir(fullPath)
		} else if (entry.name === 'package.json') {
			updatePackageJson(fullPath)
		}
	}
}

console.log(
	`Switching @industrialbank dependencies to: ${MODE.toUpperCase()} mode (${MODE === 'npm' ? VERSION : 'workspace:*'})...`,
)
processDir(ROOT_DIR)
console.log('Done.')
