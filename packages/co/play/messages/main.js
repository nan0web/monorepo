#!/usr/bin/env node

import Logger from '@nan0web/log'
import { GitMessage } from './index.js'
import CommandParser from '@nan0web/ui-cli/src/CommandParser.js'
import { OutputMessage } from '@nan0web/co'
import os from 'node:os'

const pkg = {
	name: '@nan0web/co',
	version: '0.1.0',
}

/* -------------------------------------------------------------------------- */
/*  Тестовий додаток – GitApp                                               */
/* -------------------------------------------------------------------------- */
export class GitApp {
	constructor() {
		this.handlers = {
			init: this.#handleInit.bind(this),
			commit: this.#handleCommit.bind(this),
			push: this.#handlePush.bind(this),
			pull: this.#handlePull.bind(this),
			help: this.#handleHelp.bind(this),
			version: this.#handleVersion.bind(this),
		}
	}

	*#handleInit(msg) {
		const directory = msg.body.path || '.'
		yield new OutputMessage({
			content: [
				`Initialized empty Git repository in ${directory}/.git/`,
				`Template: ${msg.body.template || 'default'}`,
			],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}

	*#handleCommit(msg) {
		yield new OutputMessage({
			content: [
				`[${msg.body.branch}] ${msg.body.message}`,
				` 1 file changed, 1 insertion(+)`,
				` create mode 100644 ${msg.body.paths || '.'}`,
			],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}

	*#handlePush(msg) {
		yield new OutputMessage({
			content: [
				`Enumerating objects: 5, done.`,
				`Counting objects: 100% (5/5), done.`,
				`Delta compression using up to ${os.cpus().length} threads`,
				`Compressing objects: 100% (3/3), done.`,
				`Writing objects: 100% (3/3), 365 bytes | 365.00 KiB/s, done.`,
				`Total 3 (delta 0), reused 0 (delta 0), pack-reused 0`,
				`To ${msg.body.remote || 'origin'}`,
				` * [new branch]      ${msg.body.branch || 'main'} -> ${msg.body.branch || 'main'}`,
			],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}

	*#handlePull(msg) {
		const directory = msg.body.directory || '.'
		const remote = msg.body.remote || 'origin'
		const branch = msg.body.refspec || msg.body.branch || 'main'

		yield new OutputMessage({
			content: [
				`From ${remote}`,
				` * branch            ${branch}     -> FETCH_HEAD`,
				`Updating 1a2b3c4..5d6e7f8`,
				`Fast-forward`,
				` src/file.txt | 1 +`,
				` 1 file changed, 1 insertion(+)`,
				` create mode 100644 src/file.txt`,
				`Pull complete into ${directory}`,
			],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}

	*#handleHelp(msg) {
		const command = msg.body._command || ''
		let cmd = GitMessage

		// Якщо вказано конкретну команду, шукаємо її
		if (command) {
			const SubCommandClass = GitMessage.Children.find((c) => c.name === command)
			if (SubCommandClass) {
				cmd = SubCommandClass
			}
		}

		const rows = []

		// Заголовок
		rows.push(`\x1b[1m${command ? `git ${command}` : 'git'}\x1b[0m - ${cmd.help || 'Git command'}`)
		rows.push('')

		// Usage
		let usage = `git ${command ? command : ''}`
		const bodyProps = Object.keys(new cmd.Body())

		if (bodyProps.length) {
			const opts = bodyProps
				.filter((k) => !['help', 'version'].includes(k))
				.map((k) => `--${k}`)
				.join(' ')
			usage += opts ? ` ${opts}` : ''
		}

		rows.push(`\x1b[1mUsage:\x1b[0m ${usage}`)
		rows.push('')

		// Options
		bodyProps.forEach((key) => {
			if (['help', 'version'].includes(key)) return

			const defaultValue = new cmd.Body()[key]
			const helpText = cmd.Body[`${key}Help`] || 'No description'

			rows.push(`  --${key.padEnd(20)} ${helpText} (default: ${JSON.stringify(defaultValue)})`)
		})
		rows.push('')

		// Subcommands
		if (!command && GitMessage.Children?.length) {
			rows.push('Available commands:')
			GitMessage.Children.forEach((C) => {
				rows.push(`  \x1b[1m${C.name}\x1b[0m - ${C.help || 'No description'}`)
			})
			rows.push('')
		}

		// Examples
		rows.push('Examples:')
		rows.push('  git init --verbose ./my-project')
		rows.push("  git commit -m 'Fix bug' --all src/")
		rows.push('  git pull origin main ./destination')
		rows.push('  git --help              # Show this help')
		rows.push('  git commit --help       # Show help for commit')

		yield new OutputMessage({
			content: rows,
			type: OutputMessage.TYPES.INFO,
		})
	}

	*#handleVersion(msg) {
		yield new OutputMessage({
			content: [`@nan0web/co git v${pkg.version}`],
			type: OutputMessage.TYPES.SUCCESS,
		})
	}

	/**
	 * Основна логіка обробки команд.
	 */
	async *run(msg) {
		// Визначаємо яку команду викликати
		const command = msg.body._command || msg.name
		const handler = this.handlers[command] || this.handlers['help']

		// Додаємо версію і допомогу в об'єкт body
		if (msg.body.version) {
			yield* this.handlers['version'](msg)
			return
		}

		if (msg.body.help) {
			yield* this.handlers['help'](msg)
			return
		}

		// Виконуємо обрану команду
		yield* handler(msg)
	}
}

/**
 * Playground runner for messages
 */
async function main() {
	// Створюємо додаток
	const app = new GitApp()
	const console = new Logger(Logger.detectLevel(process.argv))

	// Якщо аргументів немає - показуємо допомогу
	if (process.argv.length < 3) {
		const msg = { name: '', body: { help: true } }
		for await (const output of app.run(msg)) {
			console.log(output.content.join('\n'))
		}
		process.exit(1)
	}

	try {
		// ВИПРАВЛЕНО ТУТ: використовуємо CommandParser для правильного
		// парсингу команд та підкоманд замість простого GitMessage.from()
		const parser = new CommandParser(GitMessage)
		const message = parser.parse(process.argv.slice(2))

		// Встановлюємо ім'я підкоманди для подальшої обробки
		if (message.constructor !== GitMessage && message.constructor.name !== 'GitMessage') {
			message.body._command = message.constructor.name.toLowerCase().replace('message', '')
		} else if (process.argv[2] && !process.argv[2].startsWith('-')) {
			message.body._command = process.argv[2]
		}

		// Виконуємо та виводимо результат
		for await (const output of app.run(message)) {
			console.log(output.content.join('\n'))
		}
	} catch (error) {
		console.error('Error:', error.stack ?? error.message)
		process.exit(1)
	}
}

main()
