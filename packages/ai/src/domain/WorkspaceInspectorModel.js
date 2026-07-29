import { Model } from '@nan0web/types'

export class WorkspaceInspectorModel extends Model {
	static name = {
		help: 'Inspector name',
		default: '',
		type: 'string',
	}

	static type = {
		help: 'Inspector type (e.g. deterministic or generic)',
		default: 'deterministic',
		type: 'string',
	}

	static command = {
		help: 'Command to run this inspector',
		default: '',
		type: 'string',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.name
		/** @type {string} */ this.type
		/** @type {string} */ this.command
	}
}
