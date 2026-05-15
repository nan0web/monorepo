export default class BumpMonorepoApp extends ModelAsApp {
    static version: {
        positional: boolean;
        help: string;
        default: string;
        errorFormat: string;
        validate: (v: any) => string | true;
    };
    static dryRun: {
        alias: string;
        help: string;
        default: boolean;
    };
    static UI: {
        title: string;
        newVersionIn: string;
        searchingPackages: string;
        searchingApps: string;
        updatingVersions: string;
        versionUpdated: string;
        versionUpdatedDry: string;
        wouldNotBump: string;
        noDB: string;
    };
    /**
     * @param {Partial<BumpMonorepoApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<BumpMonorepoApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */
    version: string;
    /** @type {boolean} */
    dryRun: boolean;
}
import { ModelAsApp } from '@nan0web/ui';
