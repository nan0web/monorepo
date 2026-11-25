#!/usr/bin/env node
/**
 * @file CLI entry point for @nan0web/communication.app (nan0com).
 */
import { bootstrapApp } from '@nan0web/ui-cli'
import DBFS from '@nan0web/db-fs'
import { CommunicationApp } from '../src/domain/CommunicationApp.js'

const db = new DBFS({ root: process.cwd() })
await db.connect()

bootstrapApp(CommunicationApp, { db }).catch((err) => {
	console.error(err)
	process.exit(1)
})
