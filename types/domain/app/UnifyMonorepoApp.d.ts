export default class UnifyMonorepoApp extends ModelAsApp {
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
    constructor(data?: Partial<UnifyMonorepoApp>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {boolean} */
    dryRun: boolean;
}
import { ModelAsApp } from '@nan0web/ui';
