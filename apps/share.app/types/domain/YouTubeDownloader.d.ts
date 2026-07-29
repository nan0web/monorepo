/**
 * Utility for downloading audio from YouTube using yt-dlp and ffmpeg.
 */
export class YouTubeDownloader {
    /**
     * Parses a single line of yt-dlp stderr output for progress data.
     * @param {string} line
     * @returns {{ percent: number, speed: string, eta: string } | null}
     */
    static _parseProgress(line: string): {
        percent: number;
        speed: string;
        eta: string;
    } | null;
    /**
     * Downloads audio from a YouTube URL with real-time progress output.
     * @param {string} url - YouTube video URL.
     * @param {string} [outputDir='/tmp'] - Directory to save the audio file.
     * @param {function} [onProgress] - Callback({ percent: number, speed: string, eta: string })
     * @returns {Promise<{ filePath: string, title: string }>} Path to the downloaded audio and video title.
     */
    static downloadAudio(url: string, outputDir?: string, onProgress?: Function): Promise<{
        filePath: string;
        title: string;
    }>;
}
