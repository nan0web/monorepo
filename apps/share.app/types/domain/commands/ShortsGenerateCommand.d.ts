/**
 * @typedef {object} ShortsGenerateCommandOptions
 * @property {string} [shortsYaml] - Path to shorts configuration file (YAML/JSON/nan0).
 * @property {string} [videoPath] - Path to the input video file.
 * @property {string} [imgPath] - Path to the thumbnail image file.
 * @property {string} [outputDir] - Output directory for generated shorts.
 * @property {string} [transcriptPath] - Path to Whisper JSON transcript for ASS subtitles.
 * @property {boolean} [useHardwareAcceleration=false] - Use h264_videotoolbox on macOS M1.
 * @property {boolean} [auto] - Auto-segment from transcript word timestamps (no YAML needed).
 * @property {number} [autoDuration] - Target duration per short in seconds (default: 30).
 */
export class ShortsGenerateCommand extends ModelAsApp {
    static alias: string;
    static shortsYaml: {
        type: string;
        required: boolean;
        help: string;
    };
    static videoPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static imgPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static outputDir: {
        type: string;
        required: boolean;
        help: string;
    };
    static transcriptPath: {
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
    static auto: {
        type: string;
        required: boolean;
        help: string;
    };
    static autoDuration: {
        type: string;
        required: boolean;
        default: number;
        help: string;
    };
    /**
     * @param {ShortsGenerateCommandOptions} data
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: ShortsGenerateCommandOptions, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    run(): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
    }, {
        type: string;
        data: {
            success: boolean;
            message: string;
            count?: undefined;
            total?: undefined;
            subtitleCount?: undefined;
            generatedFiles?: undefined;
            videoCodec?: undefined;
        };
    } | {
        type: string;
        data: {
            success: boolean;
            count: number;
            total: number;
            subtitleCount: number;
            generatedFiles: ({
                label: any;
                start: any;
                end: any;
                videoPath: any;
                subtitlePath?: undefined;
            } | {
                label: any;
                start: any;
                end: any;
                videoPath: string;
                subtitlePath: string;
            })[];
            videoCodec: string;
            message?: undefined;
        };
    }, unknown>;
    /**
     * Auto-segment a transcript into shorts based on sentence/time boundaries.
     * @param {object} transcript - Whisper JSON transcript (segments[].words[]).
     * @param {number} targetDuration - Target seconds per short.
     * @returns {Array<{label: string, start: number, end: number}>}
     */
    _autoSegment(transcript: object, targetDuration: number): Array<{
        label: string;
        start: number;
        end: number;
    }>;
}
export type ShortsGenerateCommandOptions = {
    /**
     * - Path to shorts configuration file (YAML/JSON/nan0).
     */
    shortsYaml?: string;
    /**
     * - Path to the input video file.
     */
    videoPath?: string;
    /**
     * - Path to the thumbnail image file.
     */
    imgPath?: string;
    /**
     * - Output directory for generated shorts.
     */
    outputDir?: string;
    /**
     * - Path to Whisper JSON transcript for ASS subtitles.
     */
    transcriptPath?: string;
    /**
     * - Use h264_videotoolbox on macOS M1.
     */
    useHardwareAcceleration?: boolean;
    /**
     * - Auto-segment from transcript word timestamps (no YAML needed).
     */
    auto?: boolean;
    /**
     * - Target duration per short in seconds (default: 30).
     */
    autoDuration?: number;
};
import { ModelAsApp } from '@nan0web/ui-cli';
