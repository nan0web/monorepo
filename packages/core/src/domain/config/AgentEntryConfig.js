import { Model } from '@nan0web/types'

/**
 * Agent entry configuration inside nan0web.nan0.
 */
export default class AgentEntryConfig extends Model {
	static id = {
		help: 'Unique agent identifier',
		default: '',
		required: true,
	}
	static description = {
		help: 'Short description of agent role',
		default: '',
	}
	static workflows = {
		help: 'List of workflow markdown paths',
		type: 'string[]',
		default: [],
	}
	static inspectors = {
		help: 'List of inspector markdown paths',
		type: 'string[]',
		default: [],
	}

	/**
	 * @param {Partial<AgentEntryConfig>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Unique agent identifier */
		this.id
		/** @type {string} Short description of agent role */
		this.description
		/** @type {string[]} List of workflow markdown paths */
		this.workflows = Array.isArray(this.workflows) ? this.workflows : []
		/** @type {string[]} List of inspector markdown paths */
		this.inspectors = Array.isArray(this.inspectors) ? this.inspectors : []
	}
}
