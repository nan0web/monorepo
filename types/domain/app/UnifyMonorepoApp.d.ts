import { ModelAsApp } from '@nan0web/ui';
export default class UnifyMonorepoApp extends ModelAsApp {
    static help: {
        help: string;
        default: boolean;
    };
    static dryRun: {
        alias: string;
        help: string;
        default: boolean;
    };
    static UI: {
        title: string;
        scanning: string;
        removingGit: string;
        removingGitDry: string;
        success: string;
        successDry: string;
        error: string;
    };
    /**
     * @param {Partial<UnifyMonorepoApp>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<UnifyMonorepoApp>, options?: Partial<import('@nan0web/ui').ModelAsAppOptions>);
    /**
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>;
}
