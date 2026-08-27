import { ModelAsApp } from '@nan0web/ui';
export default class PrepareApp extends ModelAsApp {
    static help: {
        help: string;
        default: boolean;
    };
    static target: {
        help: string;
        default: string;
        positional: boolean;
    };
    static step: {
        help: string;
        default: number;
        type: string;
    };
    static UI: {
        title: string;
        starting: string;
        compiled: string;
        sessionSaved: string;
        promptSaved: string;
        errorNoDb: string;
    };
    /**
     * @param {Partial<PrepareApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<PrepareApp>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
