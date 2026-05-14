export default class ConfigApp extends ModelAsApp {
    static name: string;
    static alias: string;
    static resource: {
        type: string;
        help: string;
        positional: boolean;
        default: string;
    };
    static action: {
        type: string;
        help: string;
        positional: boolean;
        default: string;
    };
    constructor(data?: {}, options?: {});
    resource: any;
    action: any;
    run(): AsyncGenerator<import("../../core/Intent.js").ShowIntent | import("../../core/Intent.js").RenderIntent, import("../../core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '../ModelAsApp.js';
