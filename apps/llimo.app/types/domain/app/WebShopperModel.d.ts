/**
 * Web Shopper Model - Autonomous B2B Agent to aggregate prices
 *
 * @property {string} query What needs to be bought (e.g. "шредер для гілок та електропила")
 * @property {boolean} quiet Quiet mode
 */
export class WebShopperModel extends AiModelAsApp {
    static alias: string;
    static query: {
        help: string;
        default: string;
        positional: boolean;
    };
    static quiet: {
        help: string;
        default: boolean;
        type: string;
        alias: string;
    };
    static UI: {
        errorMissingQuery: string;
        errorModelsFailed: string;
        errorLoopLimit: string;
        progressAnalysis: string;
        progressThinking: string;
        progressSearching: string;
        progressReading: string;
        warnHallucination: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ query: string;
    /** @type {boolean} */ quiet: boolean;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { AiModelAsApp } from './AiModelAsApp.js';
