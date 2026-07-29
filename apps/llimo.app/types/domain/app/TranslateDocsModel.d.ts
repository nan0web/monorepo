/**
 * @property {string} source Glob pattern for source files
 * @property {string} target Target directory for translated files
 * @property {string} from Source language code
 * @property {string} to Target language code
 * @property {boolean} quiet Quiet mode (suppress logs and progress)
 */
export class TranslateDocsModel extends AiModelAsApp {
    static alias: string;
    static source: {
        help: string;
        default: string;
        positional: boolean;
    };
    static target: {
        help: string;
        default: string;
        positional: boolean;
    };
    static from: {
        help: string;
        default: string;
    };
    static to: {
        help: string;
        default: string;
    };
    static quiet: {
        help: string;
        default: boolean;
        alias: string;
        type: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ source: string;
    /** @type {string} */ target: string;
    /** @type {string} */ from: string;
    /** @type {string} */ to: string;
    /** @type {boolean} */ quiet: boolean;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { AiModelAsApp } from './AiModelAsApp.js';
