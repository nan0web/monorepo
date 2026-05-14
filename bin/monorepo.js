import { ModelAsApp, result, show } from '@nan0web/ui'
import { bootstrapApp } from '@nan0web/ui-cli'

class Monorepo extends ModelAsApp {
	/**
	 * @param {Partial<Monorepo>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		yield show(`Current directory: ${process.cwd()}`)
		const ignore = ['node_modules', '.*']
		for await (const file of this._.db.browse('@app/packages', { ignore })) {
			yield show(file)
		}
		return result({})
	}
}

bootstrapApp(Monorepo, {}).catch((err) => {
	console.error(err.message)
	process.exit(1)
})
