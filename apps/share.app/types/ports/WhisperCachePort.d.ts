/**
 * WhisperCachePort — filesystem adapter for Whisper model catalog & Hugging Face hub cache.
 */
export class WhisperCachePort {
    constructor(options?: {});
    cacheDir: any;
    cacheFile: string;
    hfHubDir: any;
    /**
     * Check whether a model repo ID exists in local Hugging Face hub cache.
     * @param {string} repoId
     * @returns {boolean}
     */
    isCachedLocally(repoId: string): boolean;
    /**
     * Read cached catalog JSON if present and within TTL.
     * @param {number} ttlMs
     * @param {boolean} [ignoreTtl=false]
     * @returns {Array|null}
     */
    readCache(ttlMs: number, ignoreTtl?: boolean): any[] | null;
    /**
     * Persist catalog JSON to disk cache.
     * @param {Array} models
     */
    writeCache(models: any[]): void;
}
