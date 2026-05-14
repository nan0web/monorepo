import { Logger } from '@nan0web/log'
import { CommandParser, CommandHelp, Select, render } from '@nan0web/ui-cli'
import Root, { RootBody } from '../messages/Auth/Root.js'
import AuthCLI from './AuthCLI.js'
import AuthDB from '@nan0web/auth-node/src/AuthDB.js'
import TokenManager from '@nan0web/auth-node/src/TokenManager.js'
import TokenRotationRegistry from '@nan0web/auth-node/src/TokenRotationRegistry.js'

/**
 * @docs
 * # CLI Entry Point
 *
 * Точка входу для командного рядка.
 *
 * ### Usage
 * ```bash
 * # Interactive mode (menu)
 * node main.js
 *
 * # Direct command
 * node main.js login --username=test --password=secret
 *
 * # Help
 * node main.js --help
 * ```
 */
export default async function main() {
	const logger = new Logger(Logger.detectLevel(process.argv))

	// --help: show help without initializing deps
	if (process.argv.includes('--help')) {
		const help = new CommandHelp({
			name: 'auth',
			help: Root.help,
			Body: RootBody,
		})
		logger.info(help.generate())
		logger.info('\nCommands: signup, confirm, login, forgot, reset, info, refresh')
		return
	}

	// Initialize dependencies
	const db = new AuthDB({ cwd: './auth-data', logger })
	const tokenManager = new TokenManager()
	const tokenRotationRegistry = new TokenRotationRegistry({ db, maxAge: 30 * 24 * 60 * 60 * 1000 })

	const cli = new AuthCLI({ db, tokenManager, logger, tokenRotationRegistry })
	const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))

	try {
		if (args.length === 0) {
			// Interactive mode — menu
			await runInteractive(cli, logger)
		} else {
			// Command mode
			const command = args[0]
			await runCommand(cli, command, logger)
		}
	} catch (/** @type {any} */ error) {
		if (error.name === 'CancelError' || error.constructor?.name === 'CancelError') {
			logger.info('\n👋 Bye!')
			return
		}
		logger.error(`Error: ${error.message}`)
		process.exit(1)
	}
}

/**
 * Interactive menu loop
 */
async function runInteractive(cli, logger) {
	const commands = cli.commands
	const options = Object.entries(commands).map(([key, cmd]) => ({
		title: cmd.title,
		value: key,
	}))

	options.push({ title: '❌ Exit', value: 'exit' })

	while (true) {
		const choice = await render(
			Select({
				message: '🔐 Auth — select action:',
				options,
			}),
		)

		if (!choice || choice === 'exit') {
			logger.info('\n👋 Bye!')
			return
		}

		await runCommand(cli, choice, logger)
		logger.info('') // empty line between commands
	}
}

/**
 * Execute a specific command
 */
async function runCommand(cli, command, logger) {
	switch (command) {
		case 'signup':
			await cli.signup()
			break
		case 'confirm':
			await cli.confirmSignup()
			break
		case 'login':
			await cli.login()
			break
		default:
			logger.error(`Unknown command: ${command}`)
			logger.info('Available: signup, confirm, login, forgot, reset, info, refresh')
	}
}

// Direct execution
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch(console.error)
}
