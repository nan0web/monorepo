import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for global LLiMo execution config
 *
 * @property {boolean} debug Verbose console logging output
 * @property {string} provider The default LLM inference provider (e.g. cerebras, openrouter)
 * @property {string} dbPath Base path where chats data and indices are stored
 * @property {number} maxTotalBudget A hard limit on total USD spent across all AI calls
 */
export class LLiMoConfigModel extends Model {
	/**
	 * @param {Partial<LLiMoConfigModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {boolean} Verbose console logging output */ this.debug
		/** @type {string} The default LLM inference provider (e.g. cerebras, openrouter) */ this.provider
		/** @type {string} Base path where chats data and indices are stored */ this._dbPath
		/** @type {number} A hard limit on total USD spent across all AI calls */ this.maxTotalBudget
	}





	static debug = {
		help: 'Verbose console logging output',
		default: false,
		type: 'boolean',
	}

	static provider = {
		help: 'The default LLM inference provider (e.g. cerebras, openrouter)',
		alias: 'p',
		default: 'cerebras',
		type: 'string',
	}

	static dbPath = {
		help: 'Base path where chats data and indices are stored',
		alias: 'db',
		default: '~/.llimo',
		type: 'string',
	}

	static maxTotalBudget = {
		help: 'A hard limit on total USD spent across all AI calls',
		alias: 'max-total-budget',
		default: 10.0,
		type: 'number',
		validate: (val) => (val > 0 ? true : LLiMoConfigModel.UI.err_budget),
	}

	static UI = {
		err_budget: 'Total budget must be greater than zero',
	}
}
