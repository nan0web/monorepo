import { ModelAsApp } from '@nan0web/ui'

/**
 * Contract for the injected AI Engine
 * @typedef {Object} AIEngineContract
 * @property {import('../../llm/ModelInfo.js').ModelInfo | null} selectedModel The currently selected AI model
 * @property {function(string): import('../../llm/ModelInfo.js').ModelInfo | undefined} getModel Get a model by ID
 * @property {function(string): import('../../llm/ModelInfo.js').ModelInfo | undefined} findModel Find a model by partial ID
 * @property {function(string, any[], any=): import('ai').StreamTextResult<any>} streamText Stream text from AI
 */

/**
 * @typedef {import('@nan0web/ui').ModelAsAppOptions & {
 *   ai?: any
 * }} AiModelAsAppOptions
 */
export class AiModelAsApp extends ModelAsApp {
	/**
	 * @param {Partial<AiModelAsApp>} [data]
	 * @param {Partial<AiModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this._ = {
			...this._,
			ai: options.ai,
		}
	}
}
