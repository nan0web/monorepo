import { ModelAsApp } from '@nan0web/ui-cli'
import { TransformModel } from '../models/TransformModel.js'
import { SeedModel } from '../models/SeedModel.js'

/**
 * PayloadCmsApp - Main application controller.
 */
export class PayloadCmsApp extends ModelAsApp {
	static alias = 'nan0cms'

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

		// Support dynamic --model instantiation (e.g. BankSeedModel / CardSeedModel)
		if (this.command instanceof SeedModel && this.model) {
			try {
				const modelPath = typeof this.model === 'string' ? this.model : ''
				if (modelPath) {
					const absolutePath = modelPath.startsWith('/')
						? modelPath
						: `${process.cwd()}/${modelPath}`
					const importedModule = await import(absolutePath)
					const CustomModelClass = Object.values(importedModule).find(
						(exp) => typeof exp === 'function'
					)
					if (CustomModelClass) {
						const customInstance = new CustomModelClass(this.command, this._)
						return yield* customInstance.run()
					}
				}
			} catch (e) {
				// Fallback to default command
			}
		}

		return yield* this.command.run()
	}
}
