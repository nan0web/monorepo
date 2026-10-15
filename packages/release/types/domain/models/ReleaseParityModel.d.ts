export class ReleaseParityModel extends Model {
    static collection: {
        type: string;
        required: boolean;
    };
    static expected: {
        type: string;
        required: boolean;
    };
    static actual: {
        type: string;
        required: boolean;
    };
    static synced: {
        type: string;
        default: boolean;
    };
    static comment: {
        type: string;
    };
    /**
     * @param {Partial<ReleaseParityModel>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<ReleaseParityModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Collection name */
    collection: string;
    /** @type {number} Expected count */
    expected: number;
    /** @type {number} Actual count */
    actual: number;
    /** @type {boolean} Synced flag */
    synced: boolean;
    /** @type {string} Audit comment */
    comment: string;
}
import { Model } from '@nan0web/types';
