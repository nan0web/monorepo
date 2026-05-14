import { UiCommand } from '../../cli/Ui.js'
import { InitProjectModel } from '../../domain/InitProjectModel.js'
import { modelFromArgv } from '@nan0web/ui-cli'

export class InitCommand extends UiCommand {
	static name = 'InitCommand'
	static help = 'Initialize a new OLMUI project (package.json, dirs...)'

	/** @type {InitProjectModel} */
	model

	constructor(input = {}) {
		super()
		this.model = input.model ?? new InitProjectModel()
	}

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
					if (!this.model.quiet) console.info(`\x1b[2m ${intent.message}\x1b[0m`)
					break
				case 'result':
					break
			}
		}
		yield false // don't return to chat
	}

	static create(input = {}) {
		const { argv = [] } = input
		const model = modelFromArgv(InitProjectModel, argv)
		return new InitCommand({ model })
	}
}
