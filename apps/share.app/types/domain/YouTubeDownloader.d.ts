/**
 * YouTubeDownloader domain model (Model-as-App).
 * Platform-agnostic domain application controller for media download capability.
 */
export class YouTubeDownloader extends ModelAsApp {
    static alias: string;
    static url: {
        help: string;
        type: string;
        required: boolean;
    };
    static outputDir: {
        help: string;
        type: string;
        default: string;
    };
    /**
     * Parses a single line of yt-dlp stderr output for progress data.
     * Pure domain helper.
     * @param {string} line
     * @returns {{ percent: number, speed: string, eta: string } | null}
     */
    static _parseProgress(line: string): {
        percent: number;
        speed: string;
        eta: string;
    } | null;
    /**
     * Resolves port and downloads audio.
     * @param {string} url - Video URL.
     * @param {string} [outputDir='/tmp'] - Target directory.
     * @param {function} [onProgress] - Progress callback.
     * @param {Object} [options] - Options context containing injected port.
     * @returns {Promise<{ filePath: string, title: string }>}
     */
    static downloadAudio(url: string, outputDir?: string, onProgress?: Function, options?: any): Promise<{
        filePath: string;
        title: string;
    }>;
    constructor(data?: {}, options?: {});
    /** @type {string} */ url: string;
    /** @type {string} */ outputDir: string;
}
import { ModelAsApp } from '@nan0web/ui';
