/**
 * Utility for downloading audio from YouTube using yt-dlp and ffmpeg.
 */
export class YouTubeDownloader {
    /**
     * Downloads audio from a YouTube URL.
     * @param {string} url - YouTube video URL.
     * @param {string} [outputDir='/tmp'] - Directory to save the audio file.
     * @returns {Promise<{ filePath: string, title: string }>} Path to the downloaded audio and video title.
     */
    static downloadAudio(url: string, outputDir?: string): Promise<{
        filePath: string;
        title: string;
    }>;
}
