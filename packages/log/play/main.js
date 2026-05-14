#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Logger from '../src/index.js'

// Get current directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read all example files
const examples = fs
	.readdirSync(__dirname)
	.filter((file) => file.endsWith('.example.js'))
	.map((file) => file.replace('.example.js', ''))

const logger = new Logger()
// Display menu
// @todo replace with better UX with arrows up/down and enter.
logger.info(Logger.RESET)
logger.info('\n🧪 Playground Examples:')
logger.info('========================')
examples.forEach((example, index) => {
	logger.info(`${index + 1}. ${example}`)
})
logger.info('\n0. Exit')
logger.info('========================')

// Get user input
logger.info(`\n${Logger.MAGENTA}Select an example to run:${Logger.RESET}`)
process.stdin.setEncoding('utf8')
process.stdin.on('readable', () => {
	const input = process.stdin.read()
	if (input !== null) {
		const choice = parseInt(input.trim())
		if (choice === 0) {
			logger.info('👋 Goodbye!')
			process.exit(0)
		}
		if (choice > 0 && choice <= examples.length) {
			const example = examples[choice - 1]
			logger.info(`\n🚗 Running ${example} example...\n`)

			// Run selected example
			import(`./${example}.example.js`)
		} else {
			logger.info('❌ Invalid choice. Please select a valid number.')
		}
	}
})
