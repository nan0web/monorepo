/**
 * ShortsToLongCompiler
 *
 * Concatenates an array of vertical Shorts (9:16) into one long horizontal (16:9) video.
 * Uses FFmpeg boxblur to fill side bands, with the original Short centered on top.
 *
 * Apple Silicon M1 note: use h264_videotoolbox for hardware-accelerated encoding.
 */
/**
 * @typedef {object} CompileOptions
 * @property {Array<string>} shortsPaths - Array of paths to short video files (9:16).
 * @property {string} outputPath - Path for the compiled long video.
 * @property {number} [targetWidth=1920] - Output video width (16:9).
 * @property {number} [targetHeight=1080] - Output video height (16:9).
 * @property {boolean} [useHardwareAcceleration=false] - Use h264_videotoolbox on macOS M1.
 * @property {number} [blurRadius=20] - Boxblur radius for side bands.
 * @property {boolean} [keepTempFiles=false] - Keep intermediate pre-processed files.
 */
export class ShortsToLongCompiler {
    /**
     * @param {CompileOptions} options
     */
    constructor(options?: CompileOptions);
    shortsPaths: string[];
    outputPath: string;
    targetWidth: number;
    targetHeight: number;
    useHardwareAcceleration: boolean;
    blurRadius: number;
    keepTempFiles: boolean;
    /**
     * Compiles all shorts into a single long 16:9 video.
     * @returns {Promise<ResultIntent & { outputPath: string, duration: number }>}
     */
    compile(): Promise<ResultIntent & {
        outputPath: string;
        duration: number;
    }>;
}
export type CompileOptions = {
    /**
     * - Array of paths to short video files (9:16).
     */
    shortsPaths: Array<string>;
    /**
     * - Path for the compiled long video.
     */
    outputPath: string;
    /**
     * - Output video width (16:9).
     */
    targetWidth?: number;
    /**
     * - Output video height (16:9).
     */
    targetHeight?: number;
    /**
     * - Use h264_videotoolbox on macOS M1.
     */
    useHardwareAcceleration?: boolean;
    /**
     * - Boxblur radius for side bands.
     */
    blurRadius?: number;
    /**
     * - Keep intermediate pre-processed files.
     */
    keepTempFiles?: boolean;
};
import { ResultIntent } from '../Models.js';
