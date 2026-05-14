#!/usr/bin/env node

import Logger from '@nan0web/log'
import { select } from '@nan0web/ui-cli'
import { runEmailDemo } from './email-demo.js'
import { runMailDBDemo } from './maildb-demo.js'

const console = new Logger({ level: 'info' })

async function menu() {
	const options = [
		{ name: 'Email Demo', value: 'email' },
		{ name: 'MailDB Demo', value: 'db' },
		{ name: 'Exit', value: 'exit' },
	]

	const choice = await select({
		title: 'Select a demo:',
		options: options.map((o) => o.name),
		console,
	})

	return options[choice.index].value
}

async function main() {
	while (true) {
		const cmd = await menu()
		if (cmd === 'email') {
			await runEmailDemo(console)
		} else if (cmd === 'db') {
			await runMailDBDemo(console)
		} else {
			console.success('👋 Bye!')
			process.exit(0)
		}
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
