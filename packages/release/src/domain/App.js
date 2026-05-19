import { ModelAsApp } from "@nan0web/ui"
import InitCommand from './InitCommand.js'
import CheckCommand from './CheckCommand.js'
import CloseCommand from './CloseCommand.js'
import DepsCommand from './DepsCommand.js'
import PublishCommand from './PublishCommand.js'
import SpecCommand from './SpecCommand.js'
import StatusCommand from './StatusCommand.js'

export class App extends ModelAsApp {
	static command = {
		help: 'Subcommand to run',
		options: [
			InitCommand,
			CheckCommand,
			CloseCommand,
			DepsCommand,
			PublishCommand,
			SpecCommand,
			StatusCommand,
		],
		default: null,
	}

	/**
	 * @param {Partial<App>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ModelAsApp} Subcommand to run */ this.command
	}
}
