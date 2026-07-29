import { UiCommand } from '../../cli/Ui.js'
import { WebShopperModel } from '../../domain/app/WebShopperModel.js'
import { modelFromArgv } from '@nan0web/ui-cli'
import { GREEN, RESET } from '../../cli/ANSI.js'

export class ShopperCommand extends UiCommand {
	static name = 'shop'
	static description = 'Starts B2B Autonomous Shopper to buy things online.'

	/** @type {WebShopperModel} */
	model

	/**
	 * @param {Partial<ShopperCommand> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.model = data.model || /** @type {any} */ (options).model || new WebShopperModel()
	}

	async *run() {
		const iter = this.model.run()
		let res = await iter.next()
		while (!res.done) {
			const intent = res.value
			if (intent && intent.type) {
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
						if (!this.model.quiet) console.info(`\x1b[2m ${intent.message}\x1b[0m`)
						break
				}
			}
			res = await iter.next()
		}

		const resultVal = res.value
		if (resultVal && resultVal.type === 'result') {
			const content = typeof resultVal.data === 'string' ? resultVal.data : JSON.stringify(resultVal.data)
			console.info(`\n${GREEN}=== ПІДСУМОК ЗАКУПІВЛІ ===${RESET}\n\n${content}\n`)
		}
		yield false // don't return to chat loop
	}

	/**
	 * @param {Record<string, any>} [input={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 * @returns {ShopperCommand}
	 */
	static create(input = {}, options = {}) {
		const { argv = [] } = input
		const model = modelFromArgv(WebShopperModel, argv)
		return new ShopperCommand({ model }, options)
	}
}
