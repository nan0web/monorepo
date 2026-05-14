import { Message } from '@nan0web/co'
import { typeOf } from '@nan0web/types'
import UI from './UI.js'

/** @typedef {Function} CommandFn */

/**
 * Abstract base class for all apps.
 * Each app processes input commands and produces output.
 */
export default class CoreApp {
	/** @type {string} App name */
	name

	/** @type {Map<string, CommandFn>} Registered command handlers */
	commands

	/** @type {Record<string, any>} App state */
	state

	/** @type {Message} Starting command parsed from argv */
	startCommand

	/**
	 * Creates a new CoreApp instance.
	 * @param {object} props - CoreApp properties
	 * @param {string} [props.name="CoreApp"] - App name
	 * @param {object} [props.state={}] - Initial state object
	 * @param {Message} [props.startCommand=new Message()] - Command line arguments to parse
	 */
	constructor(props = {}) {
		const { name = 'CoreApp', state = {}, startCommand = new Message() } = props
		this.name = String(name)
		this.state = state
		this.commands = new Map()
		// @deprecated @todo fix the argv by moving to ui-cli.
		this.startCommand = Message.from(startCommand ?? {})
	}

	/**
	 * Sets app state.
	 * @param {string|object} state - State key or object with multiple keys
	 * @param {any} [value] - State value if state is a string key
	 * @returns {object} Updated state
	 */
	set(state, value) {
		if ('string' === typeof state) {
			this.state[state] = value
		} else {
			Object.assign(this.state, state)
		}
		// @todo save state
		return this.state
	}

	/**
	 * Register a command handler.
	 * @param {string} commandName - Name of the command to register
	 * @param {Function} handler - async function or sync function that accepts params and returns output
	 */
	registerCommand(commandName, handler) {
		if (!typeOf(Function)(handler)) {
			throw new TypeError('Handler must be a function')
		}
		this.commands.set(commandName, handler)
	}

	/**
	 * Returns a string representation of the app.
	 * @returns {string} String representation including name and state
	 */
	toString() {
		return `${this.constructor.name}(name=${this.name}, state=${JSON.stringify(this.state)})`
	}

	/**
	 * Process a command message.
	 * @param {Message} msg - Command to process
	 * @param {UI} ui - UI instance to use for rendering
	 * @returns {Promise<any>} Output of the command
	 * @throws {Error} If the command is not registered
	 */
	async processCommand(msg, ui) {
		const handler = this.commands.get(msg.constructor.name)
		if (!handler) {
			throw new Error(
				[
					'Unknown command',
					': ',
					msg.constructor.name,
					'\n',
					'Available commands',
					': ',
					[...this.commands.keys()].join(', '),
				].join(''),
			)
		}
		return await handler.apply(this, [msg, ui])
	}

	/**
	 * Process an array of command messages sequentially.
	 * @param {Message[]} Messages - Array of commands to process
	 * @param {UI} ui - UI instance to use for rendering
	 * @returns {Promise<any[]>} Array of command outputs
	 */
	async processCommands(Messages, ui) {
		const results = []
		for (const cmdMsg of Messages) {
			const result = await this.processCommand(cmdMsg, ui)
			results.push(result)
		}
		return results
	}

	/**
	 * Select a command to run. Must be implemented by subclasses.
	 * @param {UI} ui - UI instance for interaction
	 * @returns {Promise<string>} Command name to execute
	 * @throws {Error} Always thrown as this method must be implemented by subclasses
	 */
	async selectCommand(ui) {
		throw new Error('Not implemented, must be implemented by subclass')
	}
}
