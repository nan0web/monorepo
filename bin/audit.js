#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import AuditMonorepoApp from '../src/domain/app/AuditMonorepoApp.js'

bootstrapApp(AuditMonorepoApp, {}).catch((err) => {
	console.error(err.message)
	process.exit(1)
})
