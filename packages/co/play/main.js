#!/usr/bin/env node

import process from 'node:process'

import Logger from '@nan0web/log'
import { select } from '@nan0web/ui-cli'

import { runCommandExampleDemo } from './command-example.js'
import { runContactFormatsDemo } from './contact-formats.js'
import { runLanguageDemo } from './language-demo.js'
import { runSimpleDemos } from './simple-demos.js'
import { runInteractiveChat } from './interactive-chat.js'

const console = new Logger({ level: 'info' })

// Clear screen and show only logo initially
console.clear()
console.info(Logger.style(Logger.LOGO, { color: 'magenta' }))

async function chooseDemo() {
	const demos = [
		{ name: 'Simple Demos', value: 'simple' },
		{ name: 'Interactive Chat', value: 'interactive' },
		{ name: 'Command Example', value: 'command' },
		{ name: 'Contact Formats', value: 'contact' },
		{ name: 'Language Demo', value: 'language' },
		{ name: '← Exit', value: 'exit' },
	]

	const choice = await select({
		title: 'Select demo to run:',
		prompt: '[me]: ',
		invalidPrompt: Logger.style('[me invalid]', { color: 'red' }) + ': ',
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
				case 'simple':
					await runSimpleDemos(console)
					break
				case 'interactive':
					await runInteractiveChat(console)
					break
				case 'command':
					await runCommandExampleDemo(console)
					break
				case 'contact':
					await runContactFormatsDemo(console)
					break
				case 'language':
					await runLanguageDemo(console)
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
				throw error
			}
		}
	}
}

main()
	.then(() => {
		process.exit(0)
	})
	.catch((err) => {
		console.error(err)
		process.exit(1)
	})
