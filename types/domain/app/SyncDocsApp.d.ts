import { ModelAsApp } from '@nan0web/ui';
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
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
