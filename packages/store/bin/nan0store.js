#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { Model } from '@nan0web/types'
import { bootstrapApp } from '@nan0web/ui-cli'
import StoreBuilderApp from '../src/domain/StoreBuilderApp.js'

/**
 * Знаходить корінь монорепозиторію по наявності папок apps та packages
 * @param {string} startPath
 * @returns {string}
 */
function findRoot(startPath) {
	let current = startPath
	for (let i = 0; i < 5; i++) {
		if (
			fs.existsSync(path.join(current, 'apps')) &&
			fs.existsSync(path.join(current, 'packages'))
		) {
			return current
		}
		const parent = path.dirname(current)
		if (parent === current) break
		current = parent
	}
	return startPath
}

class StoreShell extends Model {
	static UI = {
		help: '# 🛒 NaN0Web Store Support\n\nUsage: nan0store build',
	}

	static command = {
		help: 'Command to execute (default: build)',
		type: 'string',
		default: 'build',
	}

	async *run() {
		if (this.command === 'build') {
			yield* new StoreBuilderApp({}, this._).run()
		} else {
			yield { type: 'log', message: StoreShell.UI.help }
		}
	}
}

const monorepoRoot = findRoot(process.cwd())

// Передаємо виявлений корінь у конфігурацію bootstrapApp
bootstrapApp(StoreShell, { root: monorepoRoot })
