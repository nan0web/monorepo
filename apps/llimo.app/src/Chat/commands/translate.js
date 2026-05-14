import { UiCommand } from '../../cli/Ui.js'
import { TranslateDocsModel } from '../../domain/TranslateDocsModel.js'
import { modelFromArgv } from '@nan0web/ui-cli'

/**
 * `translate` command — translates markdown docs using AI.
 * Bridges the OLMUI TranslateDocsModel into the LLiMo chat command system.
 */
export class TranslateCommand extends UiCommand {
	static name = 'TranslateCommand'
	static help = 'Translate markdown documentation using AI (e.g., llimo translate docs/uk/**/*.md docs/en --from uk --to en)'

	/** @type {TranslateDocsModel} */
	model

	/**
	 * @param {Partial<TranslateCommand>} input
	 */
	constructor(input = {}) {
		super()
		this.model = input.model ?? new TranslateDocsModel()
	}

	/**
	 * @returns {AsyncGenerator<import("../../cli/UiOutput.js").UiOutput | boolean>}
	 */
	async *run() {
		const iter = this.model.run()
		for await (const intent of iter) {
			if (!intent || !intent.type) continue

			switch (intent.type) {
				case 'log': {
					const msg = intent.message ?? ''
					switch (intent.level) {
						case 'success': console.info(`\x1b[32m${msg}\x1b[0m`); break
						case 'error':   console.error(`\x1b[31m${msg}\x1b[0m`); break
						case 'warning': console.warn(`\x1b[33m${msg}\x1b[0m`); break
						default:        console.info(msg)
					}
					break
				}
				case 'progress':
					if (!this.model.quiet) {
						console.info(`\x1b[2m ${intent.message}\x1b[0m`)
					}
					break
				case 'result':
					break
			}
		}
		yield false
	}

	/**
	 * Factory method compatible with LLiMo command system.
	 * @param {object} [input]
	 * @param {string[]} [input.argv=[]]
	 * @returns {TranslateCommand}
	 */
	static create(input = {}) {
		const { argv = [] } = input
		const model = modelFromArgv(TranslateDocsModel, argv)
		return new TranslateCommand({ model })
	}
}
