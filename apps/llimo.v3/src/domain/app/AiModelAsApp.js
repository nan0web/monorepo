import { ModelAsApp } from '@nan0web/ui'

/**
 * @typedef {import('@nan0web/ui').ModelAsAppOptions & {
 *   ai?: any
 *   os?: any
 * }} AiModelAsAppOptions
 */
export class AiModelAsApp extends ModelAsApp {
	/**
	 * @param {Partial<AiModelAsApp> | Record<string, any>} [data]
	 * @param {Partial<AiModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this._ = {
			...this._,
			ai: options.ai,
			os: options.os,
		}
	}
}
