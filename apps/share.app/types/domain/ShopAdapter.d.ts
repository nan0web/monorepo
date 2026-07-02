/**
 * Base abstract class for E-commerce / Merchant adapters (e.g. Etsy, Printful).
 */
export class ShopAdapter extends ShareAdapter {
    /**
     * Fetches the list of products from the storefront/supplier.
     * @param {Record<string, any>} [filter]
     * @returns {Promise<any[]>}
     */
    getProducts(filter?: Record<string, any>): Promise<any[]>;
    /**
     * Fetches shop sales and margin statistics.
     * @returns {Promise<Record<string, any>>}
     */
    getSalesStats(): Promise<Record<string, any>>;
    /**
     * Updates the state of a product (e.g., active, draft, archived).
     * @param {string} id - Product ID
     * @param {string} state - New state ('active', 'draft', etc.)
     * @returns {Promise<boolean>}
     */
    updateProductState(id: string, state: string): Promise<boolean>;
}
import { ShareAdapter } from './ShareAdapter.js';
