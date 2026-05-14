import { UiCommand } from '../../cli/Ui.js'
import { WebShopperModel } from '../../domain/WebShopperModel.js'
import { modelFromArgv } from '@nan0web/ui-cli'
import { GREEN, RESET } from '../../cli/ANSI.js'

export class ShopperCommand extends UiCommand {
	static name = 'shop'
	static help = 'Starts B2B Autonomous Shopper to buy things online.'

	/** @type {WebShopperModel} */
	model

	constructor(input = {}) {
		super()
		this.model = input.model ?? new WebShopperModel()
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
					console.info(`\n${GREEN}=== ПІДСУМОК ЗАКУПІВЛІ ===${RESET}\n\n${intent.data}\n`)
					break
			}
		}
		yield false // don't return to chat loop
	}

	static create(input = {}) {
		const { argv = [] } = input
		const model = modelFromArgv(WebShopperModel, argv)
		return new ShopperCommand({ model })
	}
}
