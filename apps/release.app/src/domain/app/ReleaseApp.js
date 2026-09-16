import { ModelAsApp } from '@nan0web/ui'
import { StatusCommand } from '../StatusCommand.js'
import { WebCommand } from '../WebCommand.js'
import { PreviewCommand } from '../PreviewCommand.js'
import { CheckCommand } from '@nan0web/release'

/**
 * ReleaseApp - Main Application Controller for Global Release Hub.
 */
export class ReleaseApp extends ModelAsApp {
	static alias = 'release-app'

	static UI = { ...ModelAsApp.UI,
		title: 'Global PM-as-Code Release Hub',
	}

	static command = {
		help: 'Command to execute',
		options: [
			StatusCommand,
			WebCommand,
			PreviewCommand,
			CheckCommand,
		],
		positional: true,
		default: StatusCommand,
	}

	/**
	 * @param {Partial<ReleaseApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {any} Injected subcommand instance */ this.command
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
