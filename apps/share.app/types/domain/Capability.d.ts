/**
 * Standard Capability Model representing an adapter feature.
 */
export class Capability extends Model {
    static id: {
        help: string;
        default: any;
    };
    static title: {
        help: string;
        default: string;
    };
    static requiredParams: {
        help: string;
        default: any[];
    };
    /**
     * @param {Partial<Capability> | Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<Capability> | Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Unique capability identifier */
    id: string;
    /** @type {string} Capability display title */
    title: string;
    /** @type {string[]} Required parameter keys */
    requiredParams: string[];
}
import { Model } from './Models.js';
