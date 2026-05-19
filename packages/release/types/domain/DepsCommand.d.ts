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
    constructor(data?: Partial<DepsCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {boolean} Apply fixes automatically */ fix: boolean;
    /** @type {boolean} Update packages to the latest available versions */ latest: boolean;
}
import { ModelAsApp } from '@nan0web/ui';
