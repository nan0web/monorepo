/**
 * @typedef {object} VideoCompileCommandOptions
 * @property {string} episodeDir - Base directory for the episode.
 * @property {string} [sourceVideoPath] - Path to the source video file (if sourceType is 'video').
 * @property {string} [sourceAudioPath] - Path to the source audio file (if sourceType is 'audio').
 * @property {string} [sourceTextPath] - Path to the source text file (if sourceType is 'text').
 * @property {string} [subtitlePath] - Path to the subtitle file (e.g., .ass).
 * @property {string} [shortsDir] - Directory containing generated shorts if splitting was done.
 * @property {string} [outputPath] - Optional output path for the compiled video.
 * @property {boolean} [useHardwareAcceleration=false] - Use h264_videotoolbox on macOS M1.
 */
export class VideoCompileCommand extends ModelAsApp {
    static alias: string;
    static episodeDir: {
        type: string;
        required: boolean;
        help: string;
    };
    static sourceVideoPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static sourceAudioPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static sourceTextPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static subtitlePath: {
        type: string;
        required: boolean;
        help: string;
    };
    static shortsDir: {
        type: string;
        required: boolean;
        help: string;
    };
    static outputPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static useHardwareAcceleration: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    /**
     * @param {VideoCompileCommandOptions} data
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: VideoCompileCommandOptions, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /**
     * Resolves the video codec and encoder options string.
     * @returns {{ codec: string, opts: string }}
     */
    _getVideoEncoder(): {
        codec: string;
        opts: string;
    };
    run(): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
    }, {
        type: string;
        data: {
            success: boolean;
            outputPath: any;
            videoCodec: string;
            useHardwareAcceleration: any;
            message: string;
        };
    } | {
        type: string;
        data: {
            success: boolean;
            message: any;
            outputPath?: undefined;
            videoCodec?: undefined;
            useHardwareAcceleration?: undefined;
        };
    }, unknown>;
    getFilesFromDirectory(dirPath: any, extension: any): Promise<string[]>;
}
export type VideoCompileCommandOptions = {
    /**
     * - Base directory for the episode.
     */
    episodeDir: string;
    /**
     * - Path to the source video file (if sourceType is 'video').
     */
    sourceVideoPath?: string;
    /**
     * - Path to the source audio file (if sourceType is 'audio').
     */
    sourceAudioPath?: string;
    /**
     * - Path to the source text file (if sourceType is 'text').
     */
    sourceTextPath?: string;
    /**
     * - Path to the subtitle file (e.g., .ass).
     */
    subtitlePath?: string;
    /**
     * - Directory containing generated shorts if splitting was done.
     */
    shortsDir?: string;
    /**
     * - Optional output path for the compiled video.
     */
    outputPath?: string;
    /**
     * - Use h264_videotoolbox on macOS M1.
     */
    useHardwareAcceleration?: boolean;
};
import { ModelAsApp } from '@nan0web/ui-cli';
