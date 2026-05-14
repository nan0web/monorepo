import { Model } from '@nan0web/types'

/**
 * Model-as-Schema for Tree component.
 * Represents a hierarchical selection or navigation structure.
 */
export class TreeModel extends Model {
	static data = {
		help: 'Tree nodes defining the hierarchy',
		type: 'TreeNode[]',
		default: [],
	}

	/**
	 * @param {Partial<TreeModel> | Record<string, any>} data Model input data.
	 * @param {object} [options] Extended options (db, etc.)
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {Array<{label: string, expanded?: boolean, children?: any[]}>} Tree nodes */ this.data
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const response = yield {
			type: 'ask',
			field: 'selectedNode',
			schema: { help: 'Select a node from the tree' },
			component: 'Tree',
			model: this,
		}

		return { type: 'result', data: { selected: response.value } }
	}
}
