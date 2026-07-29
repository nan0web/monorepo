export class PipelineModel extends ModelAsApp {
    static alias: string;
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
    static task: {
        help: string;
        default: string;
    };
    static model: {
        help: string;
        default: string;
    };
    constructor(data?: {});
    intent: any;
    dir: any;
    appName: any;
    quiet: any;
    from: any;
    task: any;
    model: any;
    inferName(): any;
    run(): AsyncGenerator<any, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
