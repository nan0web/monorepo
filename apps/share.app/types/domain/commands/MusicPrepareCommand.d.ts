/**
 * MusicPrepareCommand — Prepares FAT32 media structure and ID3v2.3 MP3 files (192-320 kbps)
 * for VW Golf B7 USA (`MUSIC32` SD card).
 */
export class MusicPrepareCommand extends ModelAsApp {
    static alias: string;
    static CANONICAL_DIRS: string[];
    static UI: {
        title: string;
        invalidCategory: string;
        invalidBitrate: string;
        missingSource: string;
        sourceNotFound: string;
        done: string;
    };
    static source: {
        default: string;
        positional: boolean;
        help: string;
    };
    static target: {
        default: string;
        help: string;
    };
    static category: {
        default: string;
        help: string;
    };
    static bitrate: {
        default: string;
        help: string;
    };
    static maxSizeGb: {
        default: number;
        type: string;
        help: string;
    };
    static initStructure: {
        default: boolean;
        type: string;
        help: string;
    };
    static dryRun: {
        default: boolean;
        type: string;
        help: string;
    };
    static skipExisting: {
        default: boolean;
        type: string;
        help: string;
    };
    /**
     * Resolves relative target subdirectory for a given category.
     * @param {string} category
     * @returns {string | null}
     */
    static resolveCategoryDir(category: string): string | null;
    /**
     * Sanitizes a filename for FAT32 compatibility.
     * @param {string} filename
     * @returns {string}
     */
    static sanitizeFat32Name(filename: string): string;
    /**
     * Builds ffmpeg CLI arguments for ID3v2.3 MP3 output.
     * @param {string} inputPath
     * @param {string} outputPath
     * @param {string} [bitrate='192k']
     * @returns {string[]}
     */
    static buildFfmpegArgs(inputPath: string, outputPath: string, bitrate?: string): string[];
    /**
     * Recursively collects supported audio files from a path.
     * @param {string} srcPath
     * @returns {string[]}
     */
    static collectAudioFiles(srcPath: string): string[];
    /**
     * @param {Partial<MusicPrepareCommand>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions> & { exec?: typeof defaultExec }} [options]
     */
    constructor(data?: Partial<MusicPrepareCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions> & {
        exec?: typeof defaultExec;
    });
    /** @type {string} */ source: string;
    /** @type {string} */ target: string;
    /** @type {string} */ category: string;
    /** @type {string} */ bitrate: string;
    /** @type {number} */ maxSizeGb: number;
    /** @type {boolean} */ initStructure: boolean;
    /** @type {boolean} */ dryRun: boolean;
    /** @type {boolean} */ skipExisting: boolean;
    /** @type {typeof defaultExec} */
    $exec: typeof defaultExec;
    /**
     * Ensures canonical MUSIC32 folders exist under target.
     */
    ensureStructure(): void;
    /**
     * Executes the MUSIC32 preparation pipeline.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
/**
 * Default synchronous runner for ffmpeg.
 * @param {string} cmd
 * @param {string[]} args
 * @returns {{ status: number | null, stdout: Buffer, stderr: Buffer, error?: Error }}
 */
declare function defaultExec(cmd: string, args: string[]): {
    status: number | null;
    stdout: Buffer;
    stderr: Buffer;
    error?: Error;
};
export {};
