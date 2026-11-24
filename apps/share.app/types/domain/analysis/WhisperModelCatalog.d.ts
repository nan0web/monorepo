/**
 * WhisperModelCatalog — manages available MLX Whisper models,
 * local Hugging Face cache detection, and 7-day JSON catalog caching.
 */
export class WhisperModelCatalog {
    /**
     * Return approximate size label for a known model alias (e.g. 'medium' -> '~1.5 GB').
     * @param {string} quality
     * @returns {string|null}
     */
    static getModelSizeLabel(quality: string): string | null;
    /**
     * @param {object} [options]
     * @param {string} [options.cacheDir]
     * @param {string} [options.hfHubDir]
     * @param {number} [options.ttlMs]
     * @param {Function} [options.fetchFn]
     * @param {WhisperCachePort} [options.cachePort]
     */
    constructor(options?: {
        cacheDir?: string;
        hfHubDir?: string;
        ttlMs?: number;
        fetchFn?: Function;
        cachePort?: WhisperCachePort;
    });
    cachePort: WhisperCachePort;
    ttlMs: number;
    fetchFn: Function;
    /**
     * Check whether a model repo ID exists in local Hugging Face hub cache.
     * @param {string} repoId
     * @returns {boolean}
     */
    isCachedLocally(repoId: string): boolean;
    /**
     * List available MLX Whisper models with local cache status.
     * @param {object} [options]
     * @param {boolean} [options.offline=false]
     * @param {boolean} [options.refresh=false]
     * @returns {Promise<Array<{ alias: string|null, id: string, sizeBytes: number, sizeLabel: string, isDefault: boolean, cached: boolean }>>}
     */
    listModels(options?: {
        offline?: boolean;
        refresh?: boolean;
    }): Promise<Array<{
        alias: string | null;
        id: string;
        sizeBytes: number;
        sizeLabel: string;
        isDefault: boolean;
        cached: boolean;
    }>>;
}
import { WhisperCachePort } from '../../ports/WhisperCachePort.js';
