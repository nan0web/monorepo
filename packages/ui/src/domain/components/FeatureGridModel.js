import { Model } from '@nan0web/types'

/**
 * FeatureItemModel — OLMUI Component Model
 * Represents a single features block entry with an icon, title, and description.
 */
export class FeatureItemModel extends Model {
	static $id = '@nan0web/ui/FeatureItemModel'

	static icon = {
		help: 'Icon name from @nan0web/icons or SVG path',
		placeholder: 'stars',
		default: '',
	}
	static title = {
		help: 'Feature heading',
		placeholder: 'High Performance',
		default: '',
		required: true,
	}
	static description = {
		help: 'Detailed feature description',
		placeholder: 'Built with the latest technologies...',
		default: '',
	}

	/**
	 * @param {Partial<FeatureItemModel>} data 
	 */
	constructor(data = {}) {
		super(data)
		/** @type {string} Icon name */ this.icon
		/** @type {string} Feature heading */ this.title
		/** @type {string} Feature description */ this.description
	}
}

/**
 * FeatureGridModel — OLMUI Component Model
 * Grid of features with icons and descriptions.
 */
export class FeatureGridModel extends Model {
	static $id = '@nan0web/ui/FeatureGridModel'

	static items = {
		help: 'Array of features to display in a grid',
		type: 'FeatureItemModel[]',
		hint: FeatureItemModel,
		default: [],
	}

	/**
	 * @param {Partial<FeatureGridModel>} data
	 */
	constructor(data = {}) {
		super(data)
		/** @type {FeatureItemModel[]} List of features */
		this.items = Array.isArray(this.items)
			? this.items.map((i) => (i instanceof FeatureItemModel ? i : new FeatureItemModel(i)))
			: []
	}
}
