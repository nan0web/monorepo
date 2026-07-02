import { Model } from './Models.js'

/**
 * Standard Capability Model representing an adapter feature.
 */
export class Capability extends Model {
	static id = {
		help: 'Unique identifier of the capability (e.g. "photo", "digital-download")',
		default: undefined
	}
	static title = {
		help: 'Human-readable name of the capability shown in the UI',
		default: ''
	}
	static requiredParams = {
		help: 'List of parameters that must be configured to use this capability',
		default: []
	}

	/**
	 * @param {Partial<Capability> | Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Unique capability identifier */
		this.id = data.id ?? Capability.id.default
		/** @type {string} Capability display title */
		this.title = data.title ?? Capability.title.default
		/** @type {string[]} Required parameter keys */
		this.requiredParams = data.requiredParams ?? Capability.requiredParams.default
	}
}
