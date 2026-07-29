/**
 * Utility for splitting audio files into overlapping segments using ffmpeg,
 * and merging chunked transcripts with deduplication.
 */
export class AudioSplitter {
    /**
     * Splits an audio file into fixed-duration segments with overlap.
     * For files shorter than segmentDuration, just copies the file.
     * @param {string} inputPath - Path to the input audio file.
     * @param {Object} options
     * @param {number} [options.segmentDuration=300] - Duration of each segment in seconds (default 5m).
     * @param {number} [options.overlap=2] - Overlap in seconds on each boundary (default 2s).
     * @param {string} [options.outputDir] - Directory to save segments (defaults to input dir).
     * @param {function} [options.onProgress] - Callback({ percent, currentTime, totalTime })
     * @returns {Promise<string[]>} Array of paths to the generated segments.
     */
    static split(inputPath: string, options?: {
        segmentDuration?: number;
        overlap?: number;
        outputDir?: string;
        onProgress?: Function;
    }): Promise<string[]>;
    /**
     * Fallback split when duration probe fails — uses ffmpeg segment muxer (no overlap).
     * @param {string} inputPath
     * @param {object} options
     * @returns {Promise<string[]>}
     */
    static _splitFallback(inputPath: string, { segmentDuration, outputDir, onProgress }: object): Promise<string[]>;
    /**
     * Probe audio duration using ffprobe.
     * @param {string} inputPath
     * @returns {Promise<number|null>} duration in seconds, or null if probe fails
     */
    static probeDuration(inputPath: string): Promise<number | null>;
    /**
     * Extract a segment from an audio file using ffmpeg.
     * @param {string} inputPath
     * @param {number} startSeconds
     * @param {number} durationSeconds
     * @param {string} outputPath
     */
    static _extractSegment(inputPath: string, startSeconds: number, durationSeconds: number, outputPath: string): Promise<void>;
    /**
     * Merge overlapping chunk transcripts with deduplication.
     * Uses Levenshtein distance to find and remove duplicate text at chunk boundaries.
     * @param {string[]} transcripts - Array of transcript strings, one per chunk.
     * @returns {string} Merged transcript with duplicates removed.
     */
    static mergeTranscripts(transcripts: string[]): string;
    /**
     * Find the length of overlapping text at the boundary of two chunks.
     * Tries suffixes of `prev` against prefixes of `curr`, using Levenshtein distance
     * to detect near-matches (Whisper may transcribe the same words slightly differently).
     * @param {string} prev - Previous chunk text
     * @param {string} curr - Current chunk text
     * @param {number} [maxOverlap=50] - Max characters to search for overlap
     * @returns {number} Number of characters of curr that overlap with prev
     */
    static _findOverlap(prev: string, curr: string, maxOverlap?: number): number;
}
