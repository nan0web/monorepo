/**
 * @typedef {object} TranscribeCommandOptions
 * @property {string} [input] - Input audio/video file or glob pattern (e.g. "* / * / * /in/*.{mp3|m4a}")
 * @property {string|string[]} [format='text'] - Output format(s): text, json, sbv, srt, vtt
 * @property {string} [language='auto'] - Language code (uk, en, auto)
 * @property {string} [quality='medium'] - Whisper model size (tiny, base, small, medium, large, turbo)
 * @property {boolean} [force=false] - Overwrite existing target derivative files
 * @property {boolean} [quiet=false] - Quiet mode, suppress detailed progress
 * @property {boolean} [isTTY] - Force TTY mode or non-TTY low-frequency logger
 */
/**
 * TranscribeCommand — CLI STT & Subtitles Pipeline (v3.7.0).
 * Batch transcribes media files into multiple subtitle & text formats.
 */
export class TranscribeCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        noFilesFound: string;
        scanning: string;
        foundFiles: string;
        processingFile: string;
        fileSkipped: string;
        savingFormat: string;
        fileComplete: string;
        allComplete: string;
        errorProcessing: string;
        missingInput: string;
        batchStart: string;
        batchProgress: string;
        embeddedMetadata: string;
    };
    static MEDIA_EXTENSIONS: string[];
    static input: {
        type: string;
        required: boolean;
        positional: boolean;
        help: string;
    };
    static format: {
        type: string;
        multiselect: boolean;
        default: string[];
        help: string;
    };
    static language: {
        type: string;
        required: boolean;
        default: string;
        help: string;
    };
    static quality: {
        type: string;
        required: boolean;
        default: string;
        alias: string;
        help: string;
    };
    static force: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static quiet: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static embed: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static offline: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static tail: {
        type: string;
        required: boolean;
        default: number;
        help: string;
    };
    static models: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static initialPrompt: {
        type: string;
        required: boolean;
        alias: string;
        help: string;
    };
    static noConditionOnPreviousText: {
        type: string;
        required: boolean;
        default: boolean;
        alias: string;
        help: string;
    };
    static chunkDuration: {
        type: string;
        required: boolean;
        default: number;
        alias: string;
        help: string;
    };
    /**
     * Formats duration in seconds into human-readable string (e.g. 1h 20m, 2m 15s, 45s).
     * @param {number} seconds
     * @returns {string}
     */
    static formatDuration(seconds: number): string;
    /**
     * Embeds transcription text into media file metadata using ffmpeg.
     * @param {string} file
     * @param {string} text
     */
    static embedMetadata(file: string, text: string): Promise<void>;
    /**
     * Expands bash-like brace patterns: "a/{b,c}/d" -> ["a/b/d", "a/c/d"].
     * Also handles pipe syntax: "{mp3|m4a}" -> ["mp3", "m4a"].
     * @param {string} pattern
     * @returns {string[]}
     */
    static expandBraces(pattern: string): string[];
    /**
     * Resolves matching document paths from an In-Memory DB using expandBraces and glob matching.
     * @param {import('@nan0web/db').DB} db
     * @param {string} pattern
     * @returns {Promise<string[]>}
     */
    static findMatchingFiles(db: import("@nan0web/db").DB, pattern: string): Promise<string[]>;
    /**
     * Formats Whisper transcription result to the target extension format.
     * @param {object} whisperResult
     * @param {string} format - text|txt, json, sbv, srt, vtt
     * @returns {string}
     */
    static formatOutput(whisperResult: object, format: string): string;
    /**
     * Formats seconds to SubViewer time format: H:MM:SS.mmm
     * @param {number} seconds
     * @returns {string}
     */
    static formatTimeSbv(seconds: number): string;
    /**
     * Creates a low-frequency progress throttler for TTY vs non-TTY logging.
     * @param {object} [options]
     * @param {boolean} [options.isTTY=false]
     * @param {number} [options.intervalMs=1000]
     * @param {number} [options.stepPercent=10]
     */
    static createProgressThrottler(options?: {
        isTTY?: boolean;
        intervalMs?: number;
        stepPercent?: number;
    }): {
        shouldEmit({ percent, time }: {
            percent: any;
            time?: number;
        }): boolean;
        markEmitted({ percent, time }: {
            percent: any;
            time?: number;
        }): void;
    };
    /**
     * Append non-empty line(s) into a ring buffer bounded by limit.
     * @param {string[]} buffer
     * @param {string|string[]} textOrList
     * @param {number} limit
     */
    static pushTailLine(buffer: string[], textOrList: string | string[], limit: number): void;
    /**
     * Format progress message with up to tailLimit last decoded lines truncated to terminal width.
     * @param {string} baseMsg
     * @param {string[]} tailLines
     * @param {number} [columns=80]
     * @param {number} [tailLimit=1]
     * @returns {string}
     */
    static formatTailProgress(baseMsg: string, tailLines: string[], columns?: number, tailLimit?: number): string;
    /**
     * @param {Partial<TranscribeCommandOptions>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions> & { whisperService?: typeof WhisperTranscriptionService }} [options]
     */
    constructor(data?: Partial<TranscribeCommandOptions>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions> & {
        whisperService?: typeof WhisperTranscriptionService;
    });
    /** @type {string} Input file path or glob pattern */
    input: string;
    /** @type {string[]} Output formats (text, json, sbv, srt, vtt) */
    format: string[];
    /** @type {string} Language code */
    language: string;
    /** @type {string} Whisper model size */
    quality: string;
    /** @type {boolean} Force overwrite existing target format files */
    force: boolean;
    /** @type {boolean} Quiet mode */
    quiet: boolean;
    /** @type {boolean} Embed transcription into media metadata */
    embed: boolean;
    /** @type {boolean} Run in offline mode */
    offline: boolean;
    /** @type {number} Number of tail lines to show */
    tail: number;
    /** @type {boolean} List available Whisper models */
    models: boolean;
    /** @type {string} Initial prompt or path to vocabulary file */
    initialPrompt: string;
    /** @type {boolean} Disable conditioning on previous text */
    noConditionOnPreviousText: boolean;
    /** @type {number} Audio chunk duration in seconds */
    chunkDuration: number;
    /** @type {typeof WhisperTranscriptionService} Injected Whisper transcription service */
    $whisperService: typeof WhisperTranscriptionService;
    /** @type {Function} Injected metadata embedder */
    $embedder: Function;
    /**
     * Returns normalized array of output format strings.
     * @returns {string[]}
     */
    getFormatList(): string[];
    /**
     * Resolves companion derivative file path (replaces extension or appends).
     * @param {string} inputPath
     * @param {string} format
     * @returns {string}
     */
    getDerivativePath(inputPath: string, format: string): string;
    /**
     * Safe translation helper (interpolates {param} placeholders).
     * @param {string} text
     * @param {Record<string, any>} [params]
     * @returns {string}
     */
    t(text: string, params?: Record<string, any>): string;
    run(): AsyncGenerator<any, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
export type TranscribeCommandOptions = {
    /**
     * - Input audio/video file or glob pattern (e.g. "* / * / * /in/*.{mp3|m4a}")
     */
    input?: string;
    /**
     * - Output format(s): text, json, sbv, srt, vtt
     */
    format?: string | string[];
    /**
     * - Language code (uk, en, auto)
     */
    language?: string;
    /**
     * - Whisper model size (tiny, base, small, medium, large, turbo)
     */
    quality?: string;
    /**
     * - Overwrite existing target derivative files
     */
    force?: boolean;
    /**
     * - Quiet mode, suppress detailed progress
     */
    quiet?: boolean;
    /**
     * - Force TTY mode or non-TTY low-frequency logger
     */
    isTTY?: boolean;
};
import { ModelAsApp } from '@nan0web/ui-cli';
import { WhisperTranscriptionService } from '../analysis/WhisperTranscriptionService.js';
