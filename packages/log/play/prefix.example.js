#!/usr/bin/env node

/**
 * Playground example demonstrating the `prefix` option.
 *
 * The `prefix` is prepended to every log message. It can contain ANSI styles
 * created with `Logger.style`. In this example we style the prefix with a
 * magenta background and white text, followed by a colon and a space.
 *
 * Usage:
 *   pnpm play
 *   // Choose "prefix" from the menu
 */

import Logger from '../src/index.js'

// Build a styled prefix
const prefix =
	Logger.style(' {nan•web} ', {
		bgColor: Logger.BG_MAGENTA,
		color: Logger.WHITE,
	}) + ' '

// Create a logger with the prefix applied
const logger = new Logger({
	prefix,
	icons: true, // optional – show icons
	chromo: true, // optional – enable colors
	level: 'info',
})

// Log a simple message; the output will start with the styled prefix
logger.info('Hello terminal')
