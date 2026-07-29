/**
 * @extends {ModelAsApp}
 * @property {string | string[]} auditors
 */
export class InspectPipelineModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        noAuditors: string;
    };
    static auditors: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string | string[]} */ auditors: string | string[];
    run(): AsyncGenerator<(import("@nan0web/ui/src/core/Intent.js").AskIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("@nan0web/ui/src/core/Intent.js").ProgressIntent & {
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
    }) | (import("@nan0web/ui").AgentIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | (import("@nan0web/ui/src/core/Intent.js").ResultIntent & {
        $value?: any;
        $success?: boolean;
        $files?: Record<string, string>;
        $message?: string;
    }) | import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, any>;
}
import { ModelAsApp } from '@nan0web/ui';
