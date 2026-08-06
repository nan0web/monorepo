import { ModelAsApp } from '@nan0web/ui'
import { getPayload } from 'payload'

/**
 * @typedef {Object} AppOptions
 * @property {import('payload').Payload} [payload]
 * @property {any} [config]
 */
/** @typedef {import('@nan0web/ui').ModelAsAppOptions & AppOptions} PayloadAppOptions */

/**
 * PayloadApp
 * Base application class for Payload CMS subcommands (SeedModel, TransformModel, etc.)
 * @extends {ModelAsApp}
 */
export class PayloadApp extends ModelAsApp {
	/**
	 * @param {Partial<ModelAsApp> | Record<string, any>} [data={}]
	 * @param {Partial<PayloadAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {boolean} Show help */ this.help
		this._ = {
			...this._,
			payload: options.payload || null,
			config: options.config || null,
		}
	}

	/**
	 * Lazily initializes and returns the Payload Local API instance.
	 * @returns {Promise<import('payload').Payload>}
	 */
	async getPayloadInstance() {
		if (this._.payload) {
			return this._.payload
		}
		if (this._.config) {
			const resolvedConfig = await Promise.resolve(this._.config)
			this._.payload = await getPayload({ config: resolvedConfig })
			return this._.payload
		}
		throw new Error(
			'PayloadApp: Neither payload instance nor config was provided in options.'
		)
	}
}
