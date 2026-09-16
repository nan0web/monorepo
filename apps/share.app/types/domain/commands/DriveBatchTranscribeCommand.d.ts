/**
 * DriveBatchTranscribeCommand - Batch processes media on a disk/folder:
 * inspects existing subtitles, transcribes via Whisper, muxes soft-subtitles,
 * and caches transcripts in ~/.nan0web/share.app/transcripts/
 */
export class DriveBatchTranscribeCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        scanningDir: string;
        foundVideos: string;
        inspectingFile: string;
        hasSubtitlesSkipping: string;
        cachedTranscript: string;
        transcribing: string;
        transcriptionDone: string;
        muxingSubtitles: string;
        muxDone: string;
        allCompleted: string;
    };
    static dir: {
        type: string;
        required: boolean;
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
        help: string;
    };
    static mux: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    /**
     * @param {object} data
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: object, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    dir: any;
    language: any;
    quality: any;
    mux: any;
    /**
     * Collects video files recursively.
     * @param {string} dir
     * @returns {string[]}
     */
    _collectVideos(dir: string): string[];
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
    /**
     * Formats Whisper segments into standard SRT string.
     * @param {Array<{ start: number, end: number, text: string }>} segments
     * @returns {string}
     */
    _generateSrt(segments?: Array<{
        start: number;
        end: number;
        text: string;
    }>): string;
}
import { ModelAsApp } from '@nan0web/ui';
