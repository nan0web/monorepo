import { Message } from '@nan0web/co'
import { notEmpty } from '@nan0web/types'
import CoreApp from '../Core/CoreApp.js'
import User from '../../Model/User/User.js'
import UserUI from './UserUI.js'
import UserAppCommandMessage from './Command/Message.js'
import DepsCommand from './Command/Message.js'
import UIStream from '../../core/Stream.js'
import { StreamEntry, UiMessage } from '../../core/index.js'

/**
 * UserApp requires user name and shows Welcome view.
 * If user.name is provided in command input, ignores user input.
 * User can change user data to see another Welcome view.
 */
export default class UserApp extends CoreApp {
	/**
	 * Creates a new UserApp instance.
	 * @param {Partial<CoreApp>} [props={}] - UserApp properties
	 */
	constructor(props = {}) {
		super(props)
		this.registerCommand('setUser', this.setUser.bind(this))
		this.registerCommand('welcome', this.welcome.bind(this))
		this.registerCommand('deps', this.handleDeps.bind(this)) // Register new command
	}

	/**
	 * Handle deps command with async generator for stream processing.
	 * @param {DepsCommand} cmd - Command message with deps parameters
	 * @param {UserUI} ui - UI instance
	 * @returns {Promise<Object>} Command output
	 */
	async handleDeps(cmd, ui) {
		// Example: Use async generator to stream deps processing
		const processorFn = async () =>
			new StreamEntry({
				value: { message: `Deps command executed with fix: ${cmd.body.fix}` },
				done: true,
			})
		const generatorFn = UIStream.createProcessor(new AbortController().signal, processorFn)
		await UIStream.process(
			new AbortController().signal,
			generatorFn,
			(progress, item) => ui.output && ui.output(item.value), // Fix to output the value
			(error) => ui.output && ui.output([error]), // Assume ui has output method
			(item) => ui.output && ui.output(item.value), // Fix complete callback
		)
		return { completed: true }
	}

	/**
	 * Set user data from params.
	 * @param {UserAppCommandMessage} cmd - Command message with user data
	 * @param {UserUI} ui - UI instance
	 * @returns {Promise<{ message: string }>} Welcome message
	 */
	async setUser(cmd, ui) {
		this.state.user = User.from(cmd.body.user) // cmd is UserAppCommandMessage, has user
		const frame = await this.welcome(cmd, ui)
		return {
			message: String(frame),
		}
	}

	/**
	 * Show welcome message for current user.
	 * @param {UserAppCommandMessage} cmd - Command message
	 * @param {UserUI} ui - UI instance
	 * @returns {Promise<string[][]>} Welcome view output
	 */
	async welcome(cmd, ui) {
		if (cmd.body.user) {
			// cmd is UserAppCommandMessage, has user
			const user = User.from(cmd.body.user)
			return ui.render('Welcome', { user })
		}
		if (notEmpty(this.user)) {
			return ui.render('Welcome', { user: this.user })
		}
		const answer = await ui.ask(UiMessage.from('What is your name?'))
		this.user = User.from(answer?.body)
		return ui.render('Welcome', { user: this.user })
	}
}
