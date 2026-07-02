import { ShareAdapter, NotImplementedError } from './ShareAdapter.js'

/**
 * Base abstract class for E-commerce / Merchant adapters (e.g. Etsy, Printful).
 */
export class ShopAdapter extends ShareAdapter {
	/**
	 * Fetches the list of products from the storefront/supplier.
	 * @param {Record<string, any>} [filter]
	 * @returns {Promise<any[]>}
	 */
	async getProducts(filter = {}) {
		throw new NotImplementedError('getProducts')
	}

	/**
	 * Fetches shop sales and margin statistics.
	 * @returns {Promise<Record<string, any>>}
	 */
	async getSalesStats() {
		throw new NotImplementedError('getSalesStats')
	}

	/**
	 * Updates the state of a product (e.g., active, draft, archived).
	 * @param {string} id - Product ID
	 * @param {string} state - New state ('active', 'draft', etc.)
	 * @returns {Promise<boolean>}
	 */
	async updateProductState(id, state) {
		throw new NotImplementedError('updateProductState')
	}
}
