/**
 * TranscriptCacheService - Manages hierarchical disk-mirrored caching of transcripts.
 * Default location: ~/.nan0web/share.app/transcripts/
 */
export class TranscriptCacheService {
    /**
     * @param {object} [options]
     * @param {string} [options.baseDir]
     */
    constructor(options?: {
        baseDir?: string;
    });
    baseDir: string;
    transcriptsDir: string;
    /**
     * Generates hierarchical mirrored path for a given media file path.
     * e.g. /Volumes/MyHDD/video.mov -> ~/.nan0web/share.app/transcripts/Volumes/MyHDD/video.json
     * @param {string} filePath
     * @param {string} [ext='json']
     * @returns {string}
     */
    getCachePath(filePath: string, ext?: string): string;
    /**
     * Checks if transcript cache exists for file.
     * @param {string} filePath
     * @param {string} [ext='json']
     * @returns {boolean}
     */
    has(filePath: string, ext?: string): boolean;
    /**
     * Saves transcript object or string to cache.
     * @param {string} filePath
     * @param {object|string} data
     * @param {string} [ext='json']
     * @returns {string} Path where cache was saved
     */
    save(filePath: string, data: object | string, ext?: string): string;
    /**
     * Loads transcript from cache.
     * @param {string} filePath
     * @param {string} [ext='json']
     * @returns {object|string|null}
     */
    load(filePath: string, ext?: string): object | string | null;
}
