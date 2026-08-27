/**
 * @typedef {object} DownloadWhisperCommandOptions
 * @property {string} url - YouTube URL or local file path
 * @property {string} [output] - Output file path for the transcript
 * @property {'tiny'|'base'|'small'|'medium'|'large'} [quality] - Whisper model size (default: medium)
 * @property {'txt'|'srt'|'vtt'|'json'} [format] - Output format: txt (plain text), srt/vtt (timestamps), json (word-level timestamps)
 */
export class DownloadWhisperCommand extends ModelAsApp {
    static alias: string;
    static url: {
        type: string;
        required: boolean;
        help: string;
    };
    static output: {
        type: string;
        required: boolean;
        help: string;
    };
    static quality: {
        type: string;
        required: boolean;
        help: string;
    };
    static format: {
        type: string;
        required: boolean;
        help: string;
    };
    static language: {
        type: string;
        required: boolean;
        help: string;
    };
    static llmModel: {
        type: string;
        required: boolean;
        help: string;
    };
    static cookies: {
        type: string;
        required: boolean;
        help: string;
    };
    /**
     * Detect output format from file extension.
     * @param {string} filePath
     * @returns {'txt'|'srt'|'vtt'|'json'|'md'|null}
     */
    static _detectFormat(filePath: string): "txt" | "srt" | "vtt" | "json" | "md" | null;
    /**
     * @param {DownloadWhisperCommandOptions} data
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: DownloadWhisperCommandOptions, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ProgressIntent | import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export type DownloadWhisperCommandOptions = {
    /**
     * - YouTube URL or local file path
     */
    url: string;
    /**
     * - Output file path for the transcript
     */
    output?: string;
    /**
     * - Whisper model size (default: medium)
     */
    quality?: "tiny" | "base" | "small" | "medium" | "large";
    /**
     * - Output format: txt (plain text), srt/vtt (timestamps), json (word-level timestamps)
     */
    format?: "txt" | "srt" | "vtt" | "json";
};
import { ModelAsApp } from '@nan0web/ui-cli';
