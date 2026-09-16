export class WorkflowIndexApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        starting: string;
        done: string;
        errorNoDb: string;
    };
    static dir: {
        help: string;
        default: string;
        positional: boolean;
    };
    /**
     * @param {Partial<WorkflowIndexApp>} [data]
     * @param {import('@nan0web/ui').ModelAsAppOptions} [options]
     */
    constructor(data?: Partial<WorkflowIndexApp>, options?: import("@nan0web/ui").ModelAsAppOptions);
    /** @type {string} Target directory */
    dir: string;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ShowIntent | (import("@nan0web/ui/src/core/Intent.js").AskIntent & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui/src/core/Intent.js").LogIntent & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui/src/core/Intent.js").RenderIntent & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui").AgentIntent & import("@nan0web/ui").IntentFiles & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui/src/core/Intent.js").ResultIntent & import("@nan0web/ui").IntentBase), import("@nan0web/ui/src/core/Intent.js").ResultIntent | undefined, any>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
