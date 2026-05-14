export class ModelAsApp extends ModelAsAppUi {
    static raw: {
        help: string;
        type: string;
        default: boolean;
    };
    /**
     * @param {Partial<ModelAsApp> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<ModelAsApp> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {boolean} Raw output */ raw: boolean;
}
import { ModelAsApp as ModelAsAppUi } from '@nan0web/ui';
