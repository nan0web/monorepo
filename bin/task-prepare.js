#!/usr/bin/env node
import { bootstrapApp } from '@nan0web/ui-cli'
import PrepareApp from '../src/domain/app/PrepareApp.js'

bootstrapApp(PrepareApp, {}).catch((err) => {
	console.error(err.message)
	process.exit(1)
})
