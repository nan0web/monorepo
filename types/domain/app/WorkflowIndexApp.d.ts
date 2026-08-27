import { ModelAsApp } from '@nan0web/ui-cli';
export declare class WorkflowIndexApp extends ModelAsApp {
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
    constructor(data?: Partial<WorkflowIndexApp>, options?: import('@nan0web/ui').ModelAsAppOptions);
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ShowIntent | (import("@nan0web/ui").AgentIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("@nan0web/ui/src/core/Intent.js").AskIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("@nan0web/ui/src/core/Intent.js").LogIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("@nan0web/ui/src/core/Intent.js").RenderIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("@nan0web/ui/src/core/Intent.js").ResultIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }), import("@nan0web/ui/src/core/Intent.js").ResultIntent | undefined, any>;
}
