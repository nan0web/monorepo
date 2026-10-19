export default class CloseCommand extends ModelAsApp {
    static version: {
        help: string;
        default: string;
    };
    static UI: {
        title: string;
        help: string;
    };
    /**
     * @param {Partial<CloseCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<CloseCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Release version */
    version: string;
    /**
     * Compute destination path for closed contract test.
     * Migrates *.spec.js from releases/ to src/tests/releases/*.test.js
     * @param {string} path - Source path
     * @returns {string}
     */
    getDestinationPath(path: string): string;
}
import { ModelAsApp } from '@nan0web/ui';
