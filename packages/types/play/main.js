#!/usr/bin/env node

import process from 'node:process'
import Logger from '@nan0web/log'
import { select } from '@nan0web/ui-cli'
import { runNANOPlayground } from './nano.js'
import { runParserPlayground } from './parser.js'

const console = new Logger({ level: 'info' })

console.clear()
console.info(Logger.style(Logger.LOGO, { color: 'cyan' }))

async function chooseDemo() {
	const demos = [
		{ name: 'NANO Format Playground', value: 'nano' },
		{ name: 'Parser Playground', value: 'parser' },
		{ name: '← Exit', value: 'exit' },
	]

	const choice = await select({
		title: 'Select playground to run:',
		prompt: '[me]: ',
		invalidPrompt: Logger.style('[me invalid]', { color: 'red' }) + ': ',
		options: demos.map((d) => d.name),
		console,
	})

	return demos[choice.index].value
}

async function showMenu() {
	console.info('\n' + '='.repeat(50))
	console.info('Playground completed. Returning to menu...')
	console.info('='.repeat(50) + '\n')
}

async function main() {
	while (true) {
		try {
			const demoType = await chooseDemo()

			switch (demoType) {
				case 'nano':
					await runNANOPlayground(console)
					break
				case 'parser':
					await runParserPlayground(console)
					break
				case 'exit':
					process.exit(0)
					break
				default:
					console.warn('Unknown playground selected')
			}

			await showMenu()
		} catch (error) {
			if (error.message && error.message.includes('cancel')) {
				console.warn('\nPlayground selection cancelled. Returning to menu...')
				await showMenu()
			} else {
				throw error
			}
		}
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
