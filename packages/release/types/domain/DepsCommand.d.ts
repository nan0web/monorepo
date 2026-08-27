import { ModelAsApp } from '@nan0web/ui';
export default class DepsCommand extends ModelAsApp {
    static fix: {
        help: string;
        default: boolean;
    };
    static latest: {
        help: string;
        default: boolean;
    };
    static UI: {
        title: string;
        help: string;
    };
    /**
     * @param {Partial<DepsCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<DepsCommand>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
