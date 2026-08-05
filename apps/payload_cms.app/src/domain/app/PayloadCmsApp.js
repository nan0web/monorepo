import { ModelAsApp } from '@nan0web/ui-cli'
import { TransformModel } from '../models/TransformModel.js'
import { SeedModel } from '../models/SeedModel.js'

/**
 * PayloadCmsApp - Main application controller.
 */
export class PayloadCmsApp extends ModelAsApp {
	static alias = 'payloadcms'

	static UI = {
		title: 'NaN0Web Payload CMS Bridge & Generator',
	}

	static command = {
		help: 'Command to execute',
		options: [TransformModel, SeedModel],
		positional: true,
		default: TransformModel,
	}

	/**
	 * @param {Partial<PayloadCmsApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ModelAsApp} Injected subcommand instance */ this.command
	}

	/**
	 * Run the main controller logic.
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>}
	 */
	async *run() {
		if (this.help || !this.command || typeof this.command.run !== 'function') {
			return yield* super.run()
		}
		return yield* this.command.run()
	}
}
