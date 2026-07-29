#!/usr/bin/env node
/**
 * llimo - main CLI entry point
 */
import { bootstrapApp } from '@nan0web/ui-cli'
import { LlimoApp } from '../src/domain/app/LlimoApp.js'
import { AI } from '@nan0web/ai'

const ai = new AI()
try {
	await ai.refreshModels()
} catch (e) {
	// Load models silently
}

bootstrapApp(LlimoApp, { ai, root: '.' }).catch((err) => {
	console.error(err)
	process.exit(1)
})
