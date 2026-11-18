/**
 * VaultHeaderModel - Metadata header for vault container validation.
 */
export class VaultHeaderModel extends Model {
    static magic: {
        help: string;
        default: string;
    };
    static version: {
        help: string;
        default: number;
    };
    static createdAt: {
        help: string;
        default: () => string;
    };
    static updatedAt: {
        help: string;
        default: () => string;
    };
    /**
     * @param {Partial<VaultHeaderModel>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<VaultHeaderModel>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} */ magic: string;
    /** @type {number} */ version: number;
    /** @type {string} */ createdAt: string;
    /** @type {string} */ updatedAt: string;
}
import { Model } from '@nan0web/types';
