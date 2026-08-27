export default class SpecCommand extends ModelAsApp {
    static version: {
        help: string;
        default: string;
    };
    static UI: {
        title: string;
        help: string;
    };
    /**
     * @param {Partial<SpecCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<SpecCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Release version filter */
    version: string;
}
import { ModelAsApp } from '@nan0web/ui';
