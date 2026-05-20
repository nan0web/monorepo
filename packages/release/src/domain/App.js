import { ModelAsApp } from "@nan0web/ui"
import InitCommand from './InitCommand.js'
import CheckCommand from './CheckCommand.js'
import CloseCommand from './CloseCommand.js'
import DepsCommand from './DepsCommand.js'
import PublishCommand from './PublishCommand.js'
import SpecCommand from './SpecCommand.js'
import StatusCommand from './StatusCommand.js'
import BumpCommand from './BumpCommand.js'

export class ReleaseApp extends ModelAsApp {
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
			BumpCommand,
		],
		positional: true,
		default: null,
	}

	/**
	 * @param {Partial<ReleaseApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ModelAsApp} Subcommand to run */ this.command
	}
}
