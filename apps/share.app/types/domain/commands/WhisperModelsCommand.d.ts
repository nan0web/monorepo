/**
 * WhisperModelsCommand — displays available MLX Whisper models, sizes, and local cache status.
 */
export class WhisperModelsCommand extends ModelAsApp {
    static alias: string;
    static refresh: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static offline: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    /**
     * Format models list into a readable CLI table.
     * @param {Array} models
     * @returns {string}
     */
    static formatTable(models: any[]): string;
    /**
     * @param {object} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions> & { catalog?: WhisperModelCatalog }} [options]
     */
    constructor(data?: object, options?: Partial<import("@nan0web/ui").ModelAsAppOptions> & {
        catalog?: WhisperModelCatalog;
    });
    /** @type {boolean} */
    refresh: boolean;
    /** @type {boolean} */
    offline: boolean;
    $catalog: WhisperModelCatalog;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
import { WhisperModelCatalog } from '../analysis/WhisperModelCatalog.js';
