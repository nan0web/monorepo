/**
 * Command to bump the version of changed packages in the monorepo.
 * @property {string} version Target version to set
 * @property {string} since Git reference to diff against
 * @property {boolean} dryRun Run the command without making any changes
 */
export default class BumpCommand extends ModelAsApp {
    static version: {
        help: string;
        default: string;
        positional: boolean;
    };
    static since: {
        help: string;
        default: string;
        positional: boolean;
    };
    static dryRun: {
        alias: string;
        default: boolean;
        help: string;
    };
    static UI: {
        title: string;
        help: string;
        bumping: string;
        skippingAlreadyAtVersion: string;
        foundChangedPackages: string;
        detectingChangedPackages: string;
        noChangesDetected: string;
        errorDb: string;
    };
    /**
     * @param {Partial<BumpCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<BumpCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Target version */
    version: string;
    /** @type {string} Git reference to diff against */
    since: string;
    /** @type {boolean} Run without making changes */
    dryRun: boolean;
}
import { ModelAsApp } from '@nan0web/ui';
