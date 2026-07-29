#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import { WorkflowIndexApp } from '../src/domain/app/WorkflowIndexApp.js'

bootstrapApp(WorkflowIndexApp, { root: process.cwd() }).catch((err) => {
	console.error(err.message)
	process.exit(1)
})
