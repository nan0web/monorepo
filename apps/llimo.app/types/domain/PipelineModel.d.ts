export class PipelineModel extends ModelAsApp {
    static intent: {
        help: string;
        positional: boolean;
    };
    static dir: {
        help: string;
        positional: boolean;
        default: string;
    };
    static appName: {
        help: string;
        default: string;
    };
    static quiet: {
        default: boolean;
        type: string;
    };
    static from: {
        default: string;
    };
    constructor(data?: {});
    intent: any;
    dir: any;
    appName: any;
    quiet: any;
    from: any;
    inferName(): any;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent | undefined, unknown>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
