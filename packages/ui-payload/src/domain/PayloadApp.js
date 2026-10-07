import { ModelAsApp } from '@nan0web/ui'

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

	static UI = {
		errorNoPayloadOrConfig:
			'PayloadApp: Neither payload instance nor config was provided in options for {alias}.',
		errorNoDb: 'PayloadApp: DB instance not found in options for {alias}.',
	}

	/**
	 * Getter for database instance according to Model-as-App standard.
	 * @returns {import('@nan0web/db').DB}
	 */
	get $db() {
		if (this._?.db) return this._.db
		const { t } = this._
		const alias = this.constructor.alias || this.constructor.name
		const msg = this.constructor.UI?.errorNoDb || PayloadApp.UI.errorNoDb
		throw new Error(t ? t(msg, { alias }) : `No DB instance for ${alias}`)
	}

	/**
	 * Getter for injected or resolved Payload CMS instance.
	 * @returns {import('payload').Payload}
	 */
	get $payload() {
		if (this._?.payload) return this._.payload
		const { t } = this._
		const alias = this.constructor.alias || this.constructor.name
		const msg = this.constructor.UI?.errorNoPayloadOrConfig || PayloadApp.UI.errorNoPayloadOrConfig
		throw new Error(t(msg, { alias }))
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
			const { getPayload } = await import('payload')
			const resolvedConfig = await Promise.resolve(this._.config)
			this._.payload = await getPayload({ config: resolvedConfig })
			return this._.payload
		}
		const { t } = this._
		const alias = this.constructor.alias || this.constructor.name
		const msg = this.constructor.UI?.errorNoPayloadOrConfig || PayloadApp.UI.errorNoPayloadOrConfig
		throw new Error(t(msg, { alias }))
	}
}
