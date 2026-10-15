export class ReleaseIssueModel extends Model {
    static level: {
        type: string;
        default: string;
    };
    static code: {
        type: string;
    };
    static message: {
        type: string;
        required: boolean;
    };
    static source: {
        type: string;
    };
    static file: {
        type: string;
    };
    /**
     * @param {Partial<ReleaseIssueModel>} [data={}]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
     */
    constructor(data?: Partial<ReleaseIssueModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type { 'error' | 'warning' | 'info' } Level of issue */
    level: "error" | "warning" | "info";
    /** @type {string} Issue code */
    code: string;
    /** @type {string} Issue message */
    message: string;
    /** @type {string} Issue source */
    source: string;
    /** @type {string} Issue file */
    file: string;
}
import { Model } from '@nan0web/types';
