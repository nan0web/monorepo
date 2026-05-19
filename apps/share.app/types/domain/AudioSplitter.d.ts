/**
 * Utility for splitting audio files into segments using ffmpeg.
 */
export class AudioSplitter {
    /**
     * Splits an audio file into fixed-duration segments.
     * @param {string} inputPath - Path to the input audio file.
     * @param {Object} options
     * @param {number} [options.segmentDuration=300] - Duration of each segment in seconds (default 5m).
     * @param {string} [options.outputDir] - Directory to save segments (defaults to input dir).
     * @returns {Promise<string[]>} Array of paths to the generated segments.
     */
    static split(inputPath: string, options?: {
        segmentDuration?: number;
        outputDir?: string;
    }): Promise<string[]>;
}
