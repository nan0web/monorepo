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
     * Parse string of scene specs with alignments and offsets.
     * Examples: "code=left+100,chat=right-50,present=center+30" or "code=960x1080+0+0"
     * @param {string} specStr
     * @returns {Record<string, { align?: string, offsetX?: number, box?: string }>}
     */
    static parseSceneSpecs(specStr: string): Record<string, {
        align?: string;
        offsetX?: number;
        box?: string;
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
     * Builds FFmpeg video filter for vertical 9:16 crop with alignment and pixel offset.
     * @param {object} options
     * @param {string} [options.align='center'] - 'left' | 'right' | 'center'
     * @param {number} [options.offsetX=0] - Pixel offset X
     * @param {string} [options.crop] - Explicit crop expression override
     * @param {number} [options.targetWidth=1080]
     * @param {number} [options.targetHeight=1920]
     * @returns {string}
     */
    buildCropFilter(options?: {
        align?: string;
        offsetX?: number;
        crop?: string;
        targetWidth?: number;
        targetHeight?: number;
    }): string;
    /**
     * Extracts a single frame snapshot with 9:16 crop filter applied for instant preview.
     * @param {object} options
     * @param {string} options.source - Path to video file
     * @param {number} options.time - Timestamp in seconds
     * @param {string} options.outputPath - Destination path for preview .jpg/.png
     * @param {string} [options.align='center']
     * @param {number} [options.offsetX=0]
     * @param {string} [options.crop]
     * @returns {Promise<{ outputPath: string, time: number }>}
     */
    captureFramePreview(options: {
        source: string;
        time: number;
        outputPath: string;
        align?: string;
        offsetX?: number;
        crop?: string;
    }): Promise<{
        outputPath: string;
        time: number;
    }>;
    /**
     * Builds FFmpeg command to stitch an array of clips with xfade and acrossfade transitions.
     * @param {Array<{ path: string, duration: number }>} clips
     * @param {object} options
     * @param {string} options.outputPath
     * @param {string} [options.transition='fade']
     * @param {number} [options.transitionDuration=0.5]
     * @param {boolean} [options.acrossfade=true]
     * @param {number} [options.audioTransitionDuration]
     * @param {string} [options.videoCodec='libx264']
     * @param {string} [options.audioCodec='aac']
     * @returns {string}
     */
    buildStitchCommand(clips: Array<{
        path: string;
        duration: number;
    }>, options?: {
        outputPath: string;
        transition?: string;
        transitionDuration?: number;
        acrossfade?: boolean;
        audioTransitionDuration?: number;
        videoCodec?: string;
        audioCodec?: string;
    }): string;
    /**
     * Stitches an array of clips into one file using xfade and acrossfade.
     * @param {Array<{ path: string, duration: number }>} clips
     * @param {object} options
     * @param {string} options.outputPath
     * @param {string} [options.transition='fade']
     * @param {number} [options.transitionDuration=0.5]
     * @param {boolean} [options.acrossfade=true]
     * @param {number} [options.audioTransitionDuration]
     * @param {string} [options.videoCodec='libx264']
     * @param {string} [options.audioCodec='aac']
     * @returns {Promise<{ outputPath: string, duration: number }>}
     */
    stitch(clips: Array<{
        path: string;
        duration: number;
    }>, options?: {
        outputPath: string;
        transition?: string;
        transitionDuration?: number;
        acrossfade?: boolean;
        audioTransitionDuration?: number;
        videoCodec?: string;
        audioCodec?: string;
    }): Promise<{
        outputPath: string;
        duration: number;
    }>;
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
