import { UiCommand } from '../../cli/Ui.js'
import { TranslateDocsModel } from '../../domain/app/TranslateDocsModel.js'
import { modelFromArgv } from '@nan0web/ui-cli'

/**
 * `translate` command — translates markdown docs using AI.
 * Bridges the OLMUI TranslateDocsModel into the LLiMo chat command system.
 */
export class TranslateCommand extends UiCommand {
	static name = 'TranslateCommand'
	static description = 'Translate markdown documentation using AI (e.g., llimo translate docs/uk/**/*.md docs/en --from uk --to en)'

	/** @type {TranslateDocsModel} */
	model

	/**
	 * @param {Partial<TranslateCommand> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.model = data.model || /** @type {any} */ (options).model || new TranslateDocsModel()
	}

	/**
	 * @returns {AsyncGenerator<import("../../cli/UiOutput.js").UiOutput | boolean>}
	 */
	async *run() {
		const iter = this.model.run()
		for await (const intent of iter) {
			if (!intent || !intent.type) continue

			switch (intent.type) {
				case 'show': {
					const msg = intent.message ?? ''
					switch (intent.level) {
						case 'success': console.info(`\x1b[32m${msg}\x1b[0m`); break
						case 'error':   console.error(`\x1b[31m${msg}\x1b[0m`); break
						case 'warn':    console.warn(`\x1b[33m${msg}\x1b[0m`); break
						default:        console.info(msg)
					}
					break
				}
				case 'progress':
					if (!this.model.quiet) {
						console.info(`\x1b[2m ${intent.message}\x1b[0m`)
					}
					break
			}
		}
		yield false
	}

	/**
	 * Factory method compatible with LLiMo command system.
	 * @param {object} [input]
	 * @param {string[]} [input.argv=[]]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 * @returns {TranslateCommand}
	 */
	static create(input = {}, options = {}) {
		const { argv = [] } = input
		const model = modelFromArgv(TranslateDocsModel, argv)
		return new TranslateCommand({ model }, options)
	}
}
