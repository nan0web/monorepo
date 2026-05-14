#!/usr/bin/env node

import { next } from '@nan0web/ui-cli'

let keyPressHandlerRegistered = false

/**
 * Waits for any key press to continue
 * @param {Logger} console
 */
export async function pressAnyKey(console) {
	if (!keyPressHandlerRegistered) {
		process.stdin.setMaxListeners(process.stdin.getMaxListeners() + 1)
		keyPressHandlerRegistered = true
	}

	console.info('\n--- press any key to continue ---')
	await next()
	console.clearLine(console.cursorUp())
}
