#!/usr/bin/env node
/**
 * @file CLI entrypoint for nan0host (@nan0web/hosting.app).
 */
import { resolve } from 'node:path'
import DBFS from '@nan0web/db-fs'
import { bootstrapApp } from '@nan0web/ui-cli'
import { HostingApp } from '../src/domain/HostingApp.js'

const dirArg = process.argv.find((a) => a.startsWith('--dir='))
const envDir = resolve(dirArg ? dirArg.slice('--dir='.length) : process.cwd())

const db = new DBFS({ cwd: envDir, root: '' })
db.mount('', new DBFS({ cwd: envDir, root: '' }))
await db.connect()

bootstrapApp(HostingApp, { db, root: envDir, cwd: () => envDir }).catch((err) => {
	console.error(err)
	process.exit(1)
})
