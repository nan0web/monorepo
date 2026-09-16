/**
 * MediaInspectorService - Analyzes media files using ffprobe to detect streams, codecs, and embedded soft-subtitles.
 */
export class MediaInspectorService {
    /**
     * Runs ffprobe on file and returns parsed JSON metadata.
     * @param {string} filePath
     * @returns {object|null}
     */
    probe(filePath: string): object | null;
    /**
     * Analyzes ffprobe output object.
     * @param {object} probeOutput
     * @returns {{ hasVideo: boolean, hasAudio: boolean, hasSubtitles: boolean, subtitleStreams: Array<{ index: number, codec: string, language: string, title: string }> }}
     */
    analyzeStreams(probeOutput: object): {
        hasVideo: boolean;
        hasAudio: boolean;
        hasSubtitles: boolean;
        subtitleStreams: Array<{
            index: number;
            codec: string;
            language: string;
            title: string;
        }>;
    };
    /**
     * Checks if media file already contains embedded subtitle streams.
     * @param {string} filePath
     * @returns {boolean}
     */
    hasSubtitles(filePath: string): boolean;
    /**
     * Extracts embedded subtitles from video to an external file.
     * @param {string} filePath
     * @param {string} outPath
     * @param {number} [streamIndex=0]
     * @returns {boolean}
     */
    extractSubtitles(filePath: string, outPath: string, streamIndex?: number): boolean;
    /**
     * Gets general media info.
     * @param {string} filePath
     * @returns {object}
     */
    getVideoMeta(filePath: string): object;
}
