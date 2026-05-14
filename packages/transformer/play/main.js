#!/usr/bin/env node

import process from 'node:process'
import Logger from '@nan0web/log'
import { select } from '@nan0web/ui-cli'

import { runUpperCaseDemo } from './uppercase-transformer.js'
import { runPrefixDemo } from './prefix-transformer.js'
import { runAsyncDemo } from './async-delay-transformer.js'
import { runCompositeDemo } from './composite-transformer.js'

const console = new Logger({ level: 'info' })

// Clear screen and show logo
console.clear()
console.info(Logger.style('λ', { color: 'magenta' }) + ' @nan0web/transformer Playground')

async function chooseDemo() {
	const demos = [
		{ name: 'Uppercase Transformer', value: 'upper' },
		{ name: 'Prefix Transformer', value: 'prefix' },
		{ name: 'Async Delay Transformer', value: 'async' },
		{ name: 'Composite Chain Demo', value: 'composite' },
		{ name: '← Exit', value: 'exit' },
	]

	const choice = await select({
		title: 'Select transformer demo:',
		prompt: '[transformer]: ',
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
			const demoType = await chooseDemo()

			switch (demoType) {
				case 'upper':
					await runUpperCaseDemo(console)
					break
				case 'prefix':
					await runPrefixDemo(console)
					break
				case 'async':
					await runAsyncDemo(console)
					break
				case 'composite':
					await runCompositeDemo(console)
					break
				case 'exit':
					process.exit(0)
					break
				default:
					console.warn('Unknown demo type selected')
			}

			await showMenu()
		} catch (error) {
			if (error.message && error.message.includes('cancel')) {
				console.warn('\nDemo selection cancelled. Returning to menu...')
				await showMenu()
			} else {
				console.error(error)
				process.exit(1)
			}
		}
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
