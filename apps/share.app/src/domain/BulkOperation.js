import { Model } from './Models.js'
import { result, progress } from '@nan0web/ui'

/**
 * Abstract base class for all bulk operations running over adapters.
 */
export class BulkOperation extends Model {
	static action = { 
		help: 'Name of the bulk action to execute', 
		default: undefined 
	}
	
	/**
	 * @param {Partial<BulkOperation> | Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Bulk action name */ this.action
	}

	/**
	 * Abstract runner method.
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		throw new Error('Method run() must be implemented')
	}
}

/**
 * Bulk operation to activate drafts in a storefront.
 */
export class ActivateDraftsOperation extends BulkOperation {
	static UI = {
		activatingProduct: 'Activating drafts on the shop...',
	}

	static shopId = { 
		help: 'ID of the shop where drafts should be activated', 
		default: '' 
	}
	static filterTags = { 
		help: 'Filter active items by these tags', 
		default: [] 
	}

	/**
	 * @param {Partial<ActivateDraftsOperation> | Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.action = 'activate-drafts'
		/** @type {string} Storefront identifier */ this.shopId
		/** @type {string[]} Product tags filter */ this.filterTags
	}

	/**
	 * Active business logic executed directly by the operation.
	 * Accesses context properties via this._.
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { t, adapter } = this._
		if (!adapter) {
			throw new Error('Adapter context is missing in options')
		}

		const drafts = await adapter.getProducts({ 
			state: 'draft', 
			shopId: this.shopId, 
			tags: this.filterTags 
		})

		const count = drafts.length
		let i = 0

		for (const product of drafts) {
			i++
			yield progress(t(ActivateDraftsOperation.UI.activatingProduct), i, count)
			await adapter.updateProductState(product.id, 'active')
		}

		return result({ count: drafts.length })
	}
}
