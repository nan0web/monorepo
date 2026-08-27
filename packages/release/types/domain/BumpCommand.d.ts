import { ModelAsApp } from '@nan0web/ui';
/**
 * Command to bump the version of changed packages in the monorepo.
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
    constructor(data?: Partial<BumpCommand>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
