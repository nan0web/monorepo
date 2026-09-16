#!/usr/bin/env node

/**
 * share.js — Sovereign Media Pipeline CLI
 *
 * Delegates to ShareAppCLI (ModelAsApp) which handles all commands,
 * help generation, and argument parsing automatically.
 */

import { bootstrapApp } from '@nan0web/ui-cli'
import { ShareAppCLI } from '../src/index.js'
import { ToolCheckerPort } from '../src/ports/ToolCheckerPort.js'

bootstrapApp(ShareAppCLI, {
	toolChecker: ToolCheckerPort,
}).catch((err) => {
	console.error(err)
	process.exit(1)
})

