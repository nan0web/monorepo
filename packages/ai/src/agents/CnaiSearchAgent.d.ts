import { Model } from '@nan0web/types';
export declare class CnaiSearchAgent extends Model {
    static alias: string;
    static query: {
        help: string;
        type: string;
    };
    /**
     * @param {Partial<CnaiSearchAgent>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<CnaiSearchAgent>, options?: import('@nan0web/types').ModelOptions);
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ResultIntent, any, unknown>;
}
