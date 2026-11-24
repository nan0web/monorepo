#!/usr/bin/env node
import { runCLI } from '@nan0web/ui-cli'
import { DBFS } from '@nan0web/db-fs'
import { ReleaseApp } from '../src/domain/App.js'

const db = new DBFS({ root: process.cwd() })
await db.connect()

await runCLI(ReleaseApp, { db })
