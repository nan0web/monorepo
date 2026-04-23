export class PackageAuditor extends Model {
    static $id: string;
    static UI: {
        errorDbConnection: string;
        auditing: string;
        complete: string;
    };
    static dir: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<PackageProtocol> | Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<PackageProtocol> | Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Package directory */ dir: string;
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { Model } from '@nan0web/types';
