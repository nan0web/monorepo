#!/usr/bin/env node

import { Command } from '@nan0web/ui-cli'
import { pressAnyKey } from './simple-demos.js'
import InitMessage from './messages/InitMessage.js'

export async function runCommandExampleDemo(console) {
	console.clear()
	console.success('Command Example Demo')

	// Create a command with options and arguments
	const gitCommand = new Command({
		name: 'git',
		help: 'Distributed version control system',
		options: {
			verbose: [Boolean, false, 'Show detailed output', 'v'],
			branch: [String, 'main', 'Branch to work on', 'b'],
			force: [Boolean, false, 'Force operation', 'f'],
		},
		arguments: {
			action: [String, '', 'Git action to perform (commit, push, pull)'],
			'*': [String, 'Action arguments'],
		},
	})

	console.info('Command definition:')
	console.info(String(gitCommand))

	await pressAnyKey(console)

	// Parse command from string
	const commandString = `git commit -m "Initial commit with universal principles" --verbose`
	console.info(`\nParsing command: '${commandString}'`)

	const parsed = gitCommand.parse(commandString)
	console.info(`Action: ${parsed.args[0]}`)
	console.info(`Options: ${JSON.stringify(parsed.opts, null, 2)}`)

	await pressAnyKey(console)

	// Show usage of subcommands
	const initCommand = new Command({
		name: 'init',
		help: 'Initialize a repository',
		Message: InitMessage,
		options: {
			template: [String, 'default', 'Template to use', 't'],
		},
	})

	const mainCommand = new Command({
		name: 'git',
		help: 'Git command line tool',
		subcommands: [initCommand],
	})

	console.info('\nWith subcommand:')
	const subcommandString = 'init --template minimal --verbose'
	console.info(`Command: ${subcommandString}`)

	const parsedWithSub = mainCommand.parse(subcommandString)
	console.info(`Main args: ${parsedWithSub.args}`)
	console.info(`Main options: ${JSON.stringify(parsedWithSub.opts)}`)
	if (parsedWithSub.children[0]) {
		const sub = parsedWithSub.children[0]
		console.info(`Subcommand: ${sub.name}`)
		console.info(`Sub args: ${sub.argv}`)
		console.info(`Sub options: ${JSON.stringify(sub.opts)}`)
	}

	await pressAnyKey(console)

	console.success('\nCommand example demo complete! 🔧')
}
