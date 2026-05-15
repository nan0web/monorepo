export class PackageAuditor extends AuditorModel {
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
    constructor(data?: Partial<PackageAuditor>, options?: Partial<import("@nan0web/types").ModelOptions>);
}
import { AuditorModel } from '@nan0web/inspect';
