import { Model } from '@nan0web/core'

export class Blueprint extends Model {
	static blueprint = {
		help: 'Blueprint is a domain object that represents a blueprint of a system.',
		alias: 'bp',
		default: true,
	}

	static _name = {
		help: 'Project/agent name (Package Name)',
		alias: 'name',
		default: 'new-agent',
		validate: (val) => (val?.length > 2 ? true : 'Name must be at least 3 characters long'),
	}

	static description = {
		help: 'Short description for seed.md',
		alias: 'desc',
		default: 'Zero-Hallucination Agent',
	}

	static version = {
		help: 'Version',
		alias: 'v',
		default: '1.0.0',
	}

	static strictness = {
		help: 'Generation strictness level',
		default: 'zero-hallucination',
		options: ['zero-hallucination', 'flexible'],
	}

	/** @param {any} [data] */
	constructor(data = {}) {
		super(data)
		/** @type {boolean|undefined} */ this.blueprint
		/** @type {string|undefined} */ this.name
		/** @type {string|undefined} */ this.description
		/** @type {string|undefined} */ this.version
		/** @type {'zero-hallucination'|'flexible'|undefined} */ this.strictness

		// Map the static _name key to the instance property name
		if (this._name !== undefined) {
			this.name = this._name
			delete this._name
		}
	}
}
