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
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | (import("@nan0web/ui/src/core/Intent.js").ResultIntent & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui/src/core/Intent.js").AskIntent & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui/src/core/Intent.js").ProgressIntent & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui/src/core/Intent.js").LogIntent & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui/src/core/Intent.js").RenderIntent & import("@nan0web/ui").IntentBase) | (import("@nan0web/ui").AgentIntent & import("@nan0web/ui").IntentFiles & import("@nan0web/ui").IntentBase), import("@nan0web/ui/src/core/Intent.js").ResultIntent, any>;
}
import { ModelAsApp } from '@nan0web/ui';
