/**
 * Abstract base class for all bulk operations running over adapters.
 */
export class BulkOperation extends Model {
    static action: {
        help: string;
        default: any;
    };
    /**
     * @param {Partial<BulkOperation> | Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<BulkOperation> | Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Bulk action name */ action: string;
    /**
     * Abstract runner method.
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
}
/**
 * Bulk operation to activate drafts in a storefront.
 */
export class ActivateDraftsOperation extends BulkOperation {
    static UI: {
        activatingProduct: string;
    };
    static shopId: {
        help: string;
        default: string;
    };
    static filterTags: {
        help: string;
        default: any[];
    };
    /**
     * @param {Partial<ActivateDraftsOperation> | Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<ActivateDraftsOperation> | Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Storefront identifier */ shopId: string;
    /** @type {string[]} Product tags filter */ filterTags: string[];
}
import { Model } from './Models.js';
