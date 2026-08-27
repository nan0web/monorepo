/**
 * @typedef {object} CutSegment
 * @property {string} label - Segment identifier/filename base.
 * @property {number} start - Start time in seconds.
 * @property {number} end - End time in seconds.
 * @property {string} [type] - 'episode' | 'short' | etc.
 * @property {string} [aspectRatio] - '16:9' | '9:16'
 */
/**
 * @typedef {object} CutMap
 * @property {number} [version]
 * @property {string} source - Source video path.
 * @property {string} [aspectRatio] - Default aspect ratio (e.g. '16:9').
 * @property {CutSegment[]} segments - List of segments to slice.
 */
/**
 * VideoSlicerPort - FFmpeg-based video cutting & vertical formatting adapter.
 */
export class VideoSlicerPort {
    /**
     * Default child_process runner.
     * @param {string} cmd
     * @param {string[]} args
     * @returns {Promise<{ code: number, stdout: string, stderr: string }>}
     */
    static defaultRunner(cmd: string, args: string[]): Promise<{
        code: number;
        stdout: string;
        stderr: string;
    }>;
    /**
     * @param {object} [options]
     * @param {Function} [options.runner] - Optional custom execution runner (for mocking/testing).
     */
    constructor(options?: {
        runner?: Function;
    });
    runner: Function;
    /**
     * Builds command string list for all segments defined in a cut-map.
     * @param {CutMap} cutMap
     * @param {object} [options]
     * @param {string} [options.outputDir='tmp/output']
     * @returns {string[]}
     */
    buildCommands(cutMap: CutMap, options?: {
        outputDir?: string;
    }): string[];
    /**
     * Slices a video according to cut-map YAML data.
     * @param {CutMap} cutMap
     * @param {object} [options]
     * @param {string} [options.outputDir='tmp/output']
     * @returns {Promise<Array<{ label: string, outputPath: string, type: string }>>}
     */
    slice(cutMap: CutMap, options?: {
        outputDir?: string;
    }): Promise<Array<{
        label: string;
        outputPath: string;
        type: string;
    }>>;
}
export type CutSegment = {
    /**
     * - Segment identifier/filename base.
     */
    label: string;
    /**
     * - Start time in seconds.
     */
    start: number;
    /**
     * - End time in seconds.
     */
    end: number;
    /**
     * - 'episode' | 'short' | etc.
     */
    type?: string;
    /**
     * - '16:9' | '9:16'
     */
    aspectRatio?: string;
};
export type CutMap = {
    version?: number;
    /**
     * - Source video path.
     */
    source: string;
    /**
     * - Default aspect ratio (e.g. '16:9').
     */
    aspectRatio?: string;
    /**
     * - List of segments to slice.
     */
    segments: CutSegment[];
};
