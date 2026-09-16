import { ModelAsApp } from "@nan0web/ui"
import InitCommand from './InitCommand.js'
import CheckCommand from './CheckCommand.js'
import CloseCommand from './CloseCommand.js'
import DepsCommand from './DepsCommand.js'
import PublishCommand from './PublishCommand.js'
import SpecCommand from './SpecCommand.js'
import StatusCommand from './StatusCommand.js'
import BumpCommand from './BumpCommand.js'
import WebCommand from './WebCommand.js'
import PreviewCommand from './PreviewCommand.js'
import ViewCommand from './ViewCommand.js'
import ListCommand from './ListCommand.js'
import ServeCommand from './ServeCommand.js'

export class ReleaseApp extends ModelAsApp {
	static alias = 'release'

	static UI = {
		title: 'PM-as-Code Release Protocol (nan0release)',
	}

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
			WebCommand,
			PreviewCommand,
			ViewCommand,
			ListCommand,
			ServeCommand,
		],
		positional: true,
		default: ViewCommand,
	}

	/**
	 * @param {Partial<ReleaseApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * Run the main controller logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		if (this.help || !this.command || typeof this.command.run !== 'function') {
			return yield* super.run()
		}
		return yield* this.command.run()
	}
}

export default ReleaseApp

