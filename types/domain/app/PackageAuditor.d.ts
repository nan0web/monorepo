import { AuditorModel } from '@nan0web/inspect';
export declare class PackageAuditor extends AuditorModel {
    static $id: string;
    static UI: {
        errorDbConnection: string;
        auditing: string;
        complete: string;
    };
    /**
     * @param {Partial<PackageAuditor>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<PackageAuditor>, options?: Partial<import('@nan0web/types').ModelOptions>);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
