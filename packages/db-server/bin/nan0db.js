#!/usr/bin/env node
/**
 * @file bin/nan0db.js - Entry point for the nan0db CLI application.
 */
import { bootstrapApp } from '@nan0web/ui-cli'
import { DBServerApp } from '../src/DBServerApp.js'

bootstrapApp(DBServerApp).catch((err) => {
	console.error('[nan0db] Error:', err)
	process.exit(1)
})
