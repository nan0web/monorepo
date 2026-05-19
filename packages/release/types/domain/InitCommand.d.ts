export default class InitCommand extends ModelAsApp {
    static version: {
        help: string;
        default: string;
        errorRequired: string;
    };
    static UI: {
        title: string;
        help: string;
    };
    /**
     * @param {Partial<InitCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<InitCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Release version */ version: string;
}
import { ModelAsApp } from '@nan0web/ui';
