import { ModelAsApp } from '@nan0web/ui';
export default class PublishCommand extends ModelAsApp {
    static major: {
        help: string;
        default: boolean;
    };
    static minor: {
        help: string;
        default: boolean;
    };
    static patch: {
        help: string;
        default: boolean;
    };
    static UI: {
        title: string;
        help: string;
    };
    /**
     * @param {Partial<PublishCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<PublishCommand>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
