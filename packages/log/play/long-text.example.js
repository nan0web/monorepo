#!/usr/bin/env node

/**
 * Playground example demonstrating correct handling of long,
 * multi‑line log messages together with cursor‑up and line‑clearing.
 *
 * The script simulates scanning a data source and updates a single
 * status line on each iteration.  It deliberately creates a very long
 * message that exceeds the terminal width, causing the logger to wrap
 * the output over multiple rows.  After each iteration the previously
 * printed rows are cleared before printing the new message, preventing
 * any drift or overlapping.
 *
 * Usage:
 *   pnpm play               # pick “long‑text” from the menu
 *   # or run directly
 *   node play/long-text.example.js
 */

import Logger from '../src/index.js'

/**
 * Fake async iterator that yields a series of “file” entries.
 *
 * @param {number} count - Number of entries to generate.
 * @returns {AsyncGenerator<{file:{path:string}}>}
 */
async function* fakeStream(count) {
	for (let i = 1; i <= count; i++) {
		// Small delay makes the output easier to observe.
		await new Promise((resolve) => setTimeout(resolve, 333))
		yield { file: { path: `data/file-${i}.txt` } }
	}
}

// Helper to format numbers.
const format = new Intl.NumberFormat('en-US').format

// Logger configuration – keep colours and icons for visibility.
const logger = new Logger({
	level: 'debug',
	icons: true,
	chromo: true,
	time: true,
	spent: true,
})

// Base text shown before each progress update.
logger.info('Window size is', logger.getWindowSize())
const baseText = 'Scanning data files in'

// Write the initial line (just the base text) and store how many rows it
// occupied.  `logger.info()` returns the number of terminal rows that were
// printed (including the line after the output).  We keep this exact value.
let prevRows = logger.info(baseText)

// Simulated total number of entries – increase to see more rows.
const total = 25

// Track processed files (just for demonstration).
const files = new Set()

// Process the async stream.
for await (const entry of fakeStream(total)) {
	// Move cursor up by the number of rows printed in the previous
	// iteration and clear those lines.
	logger.cursorUp(prevRows, true)

	// Build a long message. The repeating segment forces the line to wrap.
	const longSegment = ' – processing …'.repeat(12) // very long fragment
	const msg = [prevRows, baseText, format(total), '>', entry.file.path, longSegment].join(' ')

	// Trim the message to the current terminal width (keeps wrap logic intact).
	const cutMsg = logger.cut(msg)

	// Log the new message and store the new row count.
	prevRows = logger.info(cutMsg)

	// Example bookkeeping – not used for the visual test but shows that the
	// loop can work with real data.
	files.add(entry.file.path)
}

// After the loop, clear the last status line and print a final summary.
logger.cursorUp(prevRows, true)
logger.info(`Scanned data files and found ${format(files.size)} entries.`)
