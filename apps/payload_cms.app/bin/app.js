#!/usr/bin/env node
/**
 * @file Entry point for the Payload CMS CLI application.
 */
import { bootstrapApp } from '@nan0web/ui-cli'
import { PayloadCmsApp } from '../src/domain/app/PayloadCmsApp.js'
import { withPayload } from '../src/plugins/withPayload.js'

// Automatically bootstraps the app and catches top-level initialization errors
// Plugin is registered here but executed inside bootstrapApp, where `db` is already available
const options = { plugins: [withPayload()] }

bootstrapApp(PayloadCmsApp, options)
	.then(() => {
		process.exit(0)
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
