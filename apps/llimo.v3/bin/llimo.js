#!/usr/bin/env node
/**
 * llimo.v3 - main CLI entry point
 * Required db mounts:
 * `~`        - home dir, usually '$HOME_DIR/.llimo/'
 * `@app`     - application directory where application is installed (its repo)
 * `@data`    - package local data directory, usually '@app/data'
 * `@docs`    - package local documentation directory, usually '@app/docs'
 * `.`        - current working directory, where application is run from
 * `@chat`    - directory for storing chats, usually '~/chats/'
 * `@current` - current chat directory, usually '@chat/{CHAT_ID}/'
 * `@local`   - local directory for storing configs, usually './.llimo/'
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import os from 'node:os'

import { bootstrapApp } from '@nan0web/ui-cli'
import { AI } from '@nan0web/ai'
import { DB } from '@nan0web/db'
import DBFS from '@nan0web/db-fs'

import { LlimoApp } from '../src/domain/app/LlimoApp.js'
import { OSExecutor } from '../src/utils/OSExecutor.js'

// __dirname of this bin/ file — used to resolve package-local paths
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const ai = new AI()
try {
	await ai.refreshModels()
} catch (e) {
	// Silence models resolution errors in offline/local modes
}

const appRoot = path.resolve(__dirname, '..')
const db = new DB()
try {
	db.mount('~', new DBFS({ cwd: os.homedir(), root: '.llimo' }))
	db.mount('@app', new DBFS({ cwd: appRoot }))
	db.mount('@data', new DBFS({ cwd: appRoot, root: 'data' }))
	db.mount('@docs', new DBFS({ cwd: appRoot, root: 'docs' }))
	db.mount('@chat', new DBFS({ cwd: os.homedir(), root: '.llimo/chats' }))
	db.mount('', new DBFS())
	db.mount('@local', new DBFS({ cwd: process.cwd(), root: '.llimo' }))
} catch (e) {}

const osExecutor = new OSExecutor()

bootstrapApp(LlimoApp, {
	ai,
	db,
	os: osExecutor,
}).catch((err) => {
	console.error(err)
	process.exit(1)
})
