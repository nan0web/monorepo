/**
 * SubtitleMuxerPort - Embeds soft-subtitles into video files (Stream Copy) and handles safe atomic file replacement.
 */
export class SubtitleMuxerPort {
    /**
     * Builds FFmpeg command for stream copy muxing based on container format.
     * @param {object} params
     * @param {string} params.inputVideo
     * @param {string} params.subtitlePath
     * @param {string} params.outputPath
     * @param {string} [params.language='uk']
     * @returns {string}
     */
    buildMuxCommand({ inputVideo, subtitlePath, outputPath, language }: {
        inputVideo: string;
        subtitlePath: string;
        outputPath: string;
        language?: string;
    }): string;
    /**
     * Muxes subtitle into a new video file.
     * @param {object} params
     * @param {string} params.inputVideo
     * @param {string} params.subtitlePath
     * @param {string} params.outputPath
     * @param {string} [params.language='uk']
     * @returns {boolean}
     */
    muxSoftSubtitles({ inputVideo, subtitlePath, outputPath, language }: {
        inputVideo: string;
        subtitlePath: string;
        outputPath: string;
        language?: string;
    }): boolean;
    /**
     * Safely replaces original file with temp file only if temp file passes validation.
     * Removes temp file if validation fails.
     * @param {object} params
     * @param {string} params.originalPath
     * @param {string} params.tempPath
     * @param {Function} [params.validator]
     * @returns {boolean}
     */
    safeAtomicReplace({ originalPath, tempPath, validator }: {
        originalPath: string;
        tempPath: string;
        validator?: Function;
    }): boolean;
}
