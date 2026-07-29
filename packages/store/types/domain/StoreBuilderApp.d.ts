/**
 * StoreBuilderApp — Агрегатор метаданих екосистеми (Version 2.8).
 * Діагностика: глибоке логування циклів.
 */
export class StoreBuilderApp extends Model {
    static UI: {
        title: string;
        description: string;
        icon: string;
        scanning: string;
        found: string;
        done: string;
        error: string;
    };
    static output: {
        help: string;
        type: string;
        default: string;
    };
    /**
     * @param {Partial<StoreBuilderApp> | Record<string, any>} [data] Initial state
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options] Model options
     */
    constructor(data?: Partial<StoreBuilderApp> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} */ output: string;
    run(): AsyncGenerator<import("../../../ui/types/core/Intent.js").LogIntent | import("../../../ui/types/core/Intent.js").ResultIntent | import("../../../ui/types/core/Intent.js").ProgressIntent, import("../../../ui/types/core/Intent.js").ResultIntent | undefined, unknown>;
}
export default StoreBuilderApp;
import { Model } from '@nan0web/types';
