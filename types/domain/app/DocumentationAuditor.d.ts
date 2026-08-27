import { Model } from '@nan0web/types';
export declare class DocumentationAuditor extends Model {
    static UI: {
        checking: string;
        readmeJsNotFound: string;
        readmeJsFound: string;
        readmeMdNotFound: string;
        readmeMdFound: string;
        datasetNotFound: string;
        datasetFound: string;
        checkingTranslations: string;
    };
    static dir: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
