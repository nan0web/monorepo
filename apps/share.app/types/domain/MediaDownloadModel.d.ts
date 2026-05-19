/**
 * MediaDownloadModel handles downloading from YouTube (or using local files),
 * splitting into 5-minute chunks, and transcribing each chunk locally via Whisper.
 */
export class MediaDownloadModel extends Model {
    static url: {
        help: string;
        default: any;
    };
    static status: {
        help: string;
        default: string;
    };
    static transcript: {
        help: string;
        default: string;
    };
    static title: {
        help: string;
        default: string;
    };
    static chunks: {
        help: string;
        default: any[];
    };
    constructor(raw?: {});
    /** @type {string|undefined} */
    url: string | undefined;
    /** @type {string} */
    status: string;
    /** @type {string} */
    transcript: string;
    /** @type {string} */
    title: string;
    /** @type {string[]} */
    chunks: string[];
    /**
     * Runs the download and transcription process.
     * Yields partial results after each 5-minute chunk.
     * @returns {AsyncGenerator<Object, void, unknown>}
     */
    run(): AsyncGenerator<any, void, unknown>;
}
import { Model } from './Models.js';
