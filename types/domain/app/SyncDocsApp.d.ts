export default class SyncDocsApp extends ModelAsApp {
    static UI: {
        syncing: string;
        done: string;
        error: string;
    };
    static path: {
        help: string;
        default: string;
    };
    static separator: {
        help: string;
        default: string;
    };
    static tag: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} Path to the target folder, default is @app/docs */
    path: string;
    /** @type {string} Separator for nested variables, default is '/' */
    separator: string;
    /** @type {string} Tag name for variables, default is 'v' */
    tag: string;
    run(): AsyncGenerator<import("packages/ui/types/core/Intent").ProgressIntent | import("packages/ui/types/core/Intent").ShowIntent, import("packages/ui/types/core/Intent").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
