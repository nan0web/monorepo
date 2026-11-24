/**
 * Node.js Port extending YouTubeDownloader domain ModelAsApp.
 */
export class YouTubeDownloaderPort extends YouTubeDownloader {
    /**
     * Shared yt-dlp runner for audio or video downloads.
     * @param {string} url
     * @param {string} outputDir
     * @param {function} [onProgress]
     * @param {object} [options]
     * @param {boolean} isVideo
     * @returns {Promise<{ filePath: string, title: string }>}
     */
    static _download(url: string, outputDir?: string, onProgress?: Function, options?: object, isVideo?: boolean): Promise<{
        filePath: string;
        title: string;
    }>;
    /**
     * @param {string} normalizedUrl
     * @param {string[]} cookieArgs
     * @returns {Promise<string>}
     */
    static _fetchTitle(normalizedUrl: string, cookieArgs: string[]): Promise<string>;
    /**
     * @param {string[]} args
     * @param {string} outputDir
     * @param {string} filePrefix
     * @param {string} rawTitle
     * @param {function} [onProgress]
     * @returns {Promise<{ filePath: string, title: string }>}
     */
    static _spawnDownload(args: string[], outputDir: string, filePrefix: string, rawTitle: string, onProgress?: Function): Promise<{
        filePath: string;
        title: string;
    }>;
    /**
     * Resolves cookie flags for yt-dlp.
     * Supports browser names ('chrome', 'safari'), local file paths ('./cookies.txt'), or Netscape string content.
     * @param {object} [options]
     * @returns {string[]}
     */
    static _getCookiesArgs(options?: object): string[];
}
import { YouTubeDownloader } from '../domain/YouTubeDownloader.js';
