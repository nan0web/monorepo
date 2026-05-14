import { ModelAsApp as ModelAsAppUi } from '@nan0web/ui'

export class ModelAsApp extends ModelAsAppUi {
	static raw = {
		help: 'Raw output (no UI decorations)',
		type: 'boolean',
		default: false,
	}

	/**
	 * @param {Partial<ModelAsApp> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Raw output */ this.raw
	}
}
