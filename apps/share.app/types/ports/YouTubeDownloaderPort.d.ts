/**
 * Node.js Port extending YouTubeDownloader domain ModelAsApp.
 */
export class YouTubeDownloaderPort extends YouTubeDownloader {
    /**
     * Downloads audio from a YouTube/TikTok URL with real-time progress output.
     * @param {string} url - Video URL.
     * @param {string} [outputDir='/tmp'] - Directory to save the audio file.
     * @param {function} [onProgress] - Callback({ percent: number, speed: string, eta: string })
     * @returns {Promise<{ filePath: string, title: string }>} Path to the downloaded audio and video title.
     */
    static downloadAudio(url: string, outputDir?: string, onProgress?: Function, options?: {}): Promise<{
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
