#!/usr/bin/env node

/**
 * nan0ai — Unified CLI for @nan0web/ai (OLMUI Edition)
 * All logic is dispatched via AiAppModel.
 */
import { AiAppModel } from '../src/domain/AiAppModel.js'
import { bootstrapApp } from '@nan0web/ui-cli'
import DBFS from '@nan0web/db-fs'
import os from 'node:os'
import path from 'node:path'

const home = os.homedir()
const cwd = process.cwd()

let claudeDir
if (process.platform === 'win32') {
	const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming')
	claudeDir = path.join(appData, 'Claude')
} else if (process.platform === 'linux') {
	claudeDir = path.join(home, '.config', 'Claude')
} else {
	claudeDir = path.join(home, 'Library', 'Application Support', 'Claude')
}

const db = new DBFS({ root: cwd })
db.mount('@ws', new DBFS({ root: cwd }))
db.mount('@app', new DBFS({ root: path.resolve(import.meta.dirname, '..') }))
db.mount('@gemini', new DBFS({ root: path.join(home, '.gemini') }))
db.mount('@gemini-local', new DBFS({ root: path.join(cwd, '.gemini') }))
db.mount('@cursor', new DBFS({ root: path.join(home, '.cursor') }))
db.mount('@cursor-local', new DBFS({ root: path.join(cwd, '.cursor') }))
db.mount('@vscode', new DBFS({ root: path.join(home, '.vscode') }))
db.mount('@vscode-local', new DBFS({ root: path.join(cwd, '.vscode') }))
db.mount('@claude', new DBFS({ root: claudeDir }))

bootstrapApp(AiAppModel, {
	db,
	appName: 'nan0ai',
})
