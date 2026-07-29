/**
 * @typedef {object} SubtitleGenerateCommandOptions
 * @property {string} transcriptPath - Path to the JSON transcript file from Whisper.
 * @property {number} videoDuration - Duration of the video in seconds.
 * @property {string} [outputPath] - Path to save the generated .ass subtitle file.
 * @property {number} [maxBlockWidth=850] - Maximum pixel width for a subtitle block.
 * @property {number} [maxWordsPerBlock=3] - Maximum words per subtitle block.
 */
export class SubtitleGenerateCommand extends ModelAsApp {
    static alias: string;
    static transcriptPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static videoDuration: {
        type: string;
        required: boolean;
        help: string;
    };
    static outputPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static maxBlockWidth: {
        type: string;
        required: boolean;
        default: number;
        help: string;
    };
    static maxWordsPerBlock: {
        type: string;
        required: boolean;
        default: number;
        help: string;
    };
    /**
     * @param {SubtitleGenerateCommandOptions} data
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: SubtitleGenerateCommandOptions, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    run(): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
    } | {
        type: string;
        message: string;
        level?: undefined;
    }, {
        type: string;
        data: {
            success: boolean;
            message: string;
            outputPath?: undefined;
            subtitleCount?: undefined;
        };
    } | {
        type: string;
        data: {
            success: boolean;
            outputPath: any;
            subtitleCount: number;
            message?: undefined;
        };
    }, unknown>;
}
export type SubtitleGenerateCommandOptions = {
    /**
     * - Path to the JSON transcript file from Whisper.
     */
    transcriptPath: string;
    /**
     * - Duration of the video in seconds.
     */
    videoDuration: number;
    /**
     * - Path to save the generated .ass subtitle file.
     */
    outputPath?: string;
    /**
     * - Maximum pixel width for a subtitle block.
     */
    maxBlockWidth?: number;
    /**
     * - Maximum words per subtitle block.
     */
    maxWordsPerBlock?: number;
};
import { ModelAsApp } from '@nan0web/ui-cli';
