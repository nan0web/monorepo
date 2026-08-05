#!/usr/bin/env node
/**
 * @file Entry point for the Payload CMS CLI application.
 */
import { bootstrapApp } from '@nan0web/ui-cli'
import { PayloadCmsApp } from '../src/domain/app/PayloadCmsApp.js'

// Automatically bootstraps the app and catches top-level initialization errors
bootstrapApp(PayloadCmsApp).catch((err) => {
	console.error(err)
	process.exit(1)
})
