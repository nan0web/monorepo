import Logger from '@nan0web/log';
export type createProgressOptions = {
    startTime?: number;
    fps?: number;
};
/**
 * @typedef {Object} createProgressOptions
 * @property {number} [startTime=Date.now()]
 * @property {number} [fps=30]
 */
/**
 * Create a progress function with interval of FPS.
 * @param {({ startTime, elapsed }) => void} fn
 * @param {createProgressOptions} param1
 * @returns {NodeJS.Timeout}
 */
export declare function createProgress(fn: ({ startTime, elapsed }: any) => void, { startTime, fps }: createProgressOptions): NodeJS.Timeout;
export type OutputProgressInput = {
    /**
     * Logger instance as a console processor
     */
    logger?: Logger;
    /**
     * Number of lines to print out
     */
    maxLines?: number;
    /**
     * Array of chunks to print out
     */
    chunks?: string[];
    /**
     * Frames per second
     */
    fps?: number;
    /**
     * Recent printed amount of lines
     */
    printed?: number;
};
/**
 * @typedef {Object} OutputProgressInput
 * @property {Logger} [logger] Logger instance as a console processor
 * @property {number} [maxLines=3] Number of lines to print out
 * @property {string[]} [chunks=[]] Array of chunks to print out
 * @property {number} [fps=30] Frames per second
 * @property {number} [printed=0] Recent printed amount of lines
 */
/**
 * @param {OutputProgressInput} input
 * @returns {NodeJS.Timeout}
 */
export declare function createOutputProgress(input: OutputProgressInput): NodeJS.Timeout;
/**
 * Pause execution for a given number of milliseconds.
 *
 * @param {number} [ms=1_000] - Milliseconds to wait, 1,000 is default.
 * @returns {Promise<void>} A promise that resolves after the timeout.
 *
 * @example
 *   await pause(10); // pauses for ~10 ms
 */
export declare function pause(ms?: number): Promise<void>;
