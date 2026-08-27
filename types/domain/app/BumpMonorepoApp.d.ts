import { ModelAsApp } from '@nan0web/ui';
export default class BumpMonorepoApp extends ModelAsApp {
    static help: {
        help: string;
        default: boolean;
    };
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
    constructor(data?: Partial<BumpMonorepoApp>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
