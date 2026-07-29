export class LogicPipelineModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static task: {
        help: string;
        default: string;
        positional: boolean;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ task: string;
    run(): AsyncGenerator<any, import("@nan0web/ui/src/core/Intent.js").ResultIntent, any>;
}
import { ModelAsApp } from '@nan0web/ui';
