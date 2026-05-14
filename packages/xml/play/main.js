#!/usr/bin/env node

import process from 'node:process'
import fs from 'node:fs/promises'

import { select, next } from '@nan0web/ui-cli'
import Logger from '@nan0web/log'

const console = new Logger({ level: 'info', icons: true, chromo: true })

// Clear screen and show logo
console.clear()
console.info(Logger.style(Logger.LOGO, { color: 'magenta' }))

/**
 * Loads and runs a demo module
 * @param {string} path - Relative path to the demo module
 */
async function runDemo(path) {
	try {
		const { run } = await import(path)
		await run(console)
	} catch (error) {
		if (error.code === 'ERR_MODULE_NOT_FOUND') {
			console.error(`Demo not found: ${path}`)
		} else {
			console.error(`Error running demo ${path}:`, error.message)
		}
	}
}

async function chooseDemo() {
	const demos = [
		{ name: 'Simple XML Rendering', value: './simple.js' },
		{ name: 'XML Decode (v1.1.0)', value: './decode.js' },
		{ name: 'Sitemap Generation', value: './sitemap.js' },
		{ name: 'Atom Feed Example', value: './atom.js' },
		{ name: 'Self-Closed Tags', value: './self-closed.js' },
		{ name: 'Embedded Attributes (div.class#id)', value: './embedded-attrs.js' },
		{ name: 'Case Transformations', value: './case.js' },
		{ name: '← Exit', value: 'exit' },
	]

	const choice = await select({
		title: 'Select XML demo to run:',
		prompt: '[demo]: ',
		invalidPrompt: Logger.style('[invalid]', { color: 'red' }) + ': ',
		options: demos.map((d) => d.name),
		console,
	})

	return demos[choice.index].value
}

async function showMenu() {
	console.info('\n' + '='.repeat(50))
	console.info('Demo completed. Returning to menu...')
	console.info('='.repeat(50) + '\n')
}

async function main() {
	while (true) {
		try {
			const demoPath = await chooseDemo()

			if (demoPath === 'exit') {
				console.info('Goodbye! 👋')
				process.exit(0)
			}

			await runDemo(new URL(demoPath, import.meta.url))
			await showMenu()
		} catch (error) {
			if (error.message && error.message.includes('cancel')) {
				console.warn('\nDemo selection cancelled. Returning to menu...')
				await showMenu()
			} else {
				console.error('Unexpected error:', error)
				process.exit(1)
			}
		}
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
