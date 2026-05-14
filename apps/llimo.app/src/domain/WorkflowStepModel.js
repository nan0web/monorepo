import { Model } from '@nan0web/types'
import { resolveDefaults, resolveAliases } from '@nan0web/types'

/**
 * Model-as-Schema for a single step within a LLiMo Workflow.
 */
export class WorkflowStepModel extends Model {





	static name = {
		help: 'The readable name or title of the step',
		default: '',
		type: 'string',
		validate: (val) => (val && val.length > 0 ? true : WorkflowStepModel.UI.err_name),
	}

	static command = {
		help: 'The proxy command to execute (ALL commands must start with @, e.g. @llimo test, @web, @ls)',
		default: '',
		type: 'string',
		validate: (val) => (val && val.startsWith('@') ? true : WorkflowStepModel.UI.err_proxy),
	}

	static args = {
		help: 'Arguments or payload block passed to the command',
		default: [],
		type: 'array',
	}

	static verify = {
		help: 'Optional script to verify logic',
		default: '',
		type: 'string',
	}

	static maxCost = {
		help: 'Maximum cost limit for this step or retry loop in case of LLM calls',
		default: 0.5,
		type: 'number',
	}

	static UI = {
		err_name: 'Step name is required',
		err_proxy: 'Command proxy must start with @ (e.g. @llimo, @web)',
	}

	constructor(data = {}) {
		super(data)
		/** @type {string} The readable name or title of the step */ this.name
		/** @type {string} The proxy command to execute (ALL commands must start with the at-symbol) */ this.command
		/** @type {any[]} Arguments or payload block passed to the command */ this.args
		/** @type {string} Optional script to verify logic */ this.verify
		/** @type {number} Maximum cost limit for this step or retry loop in case of LLM calls */ this.maxCost

	}
}
