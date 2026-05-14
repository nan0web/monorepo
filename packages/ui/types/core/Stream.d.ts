/**
 * Agnostic UI stream for processing progress using async generators.
 *
 * @class UIStream
 */
export default class UIStream {
    /**
     * Creates an async generator that runs the supplied processor function.
     *
     * @param {AbortSignal} signal - Abort signal.
     * @param {() => Promise<StreamEntry>} processorFn - Async function that returns a result.
     * @returns {() => AsyncGenerator<StreamEntry>} Async generator function.
     */
    static createProcessor(signal: AbortSignal, processorFn: () => Promise<StreamEntry>): () => AsyncGenerator<StreamEntry>;
    /**
     * Runs an async generator with progress callbacks and abort handling.
     *
     * @param {AbortSignal} signal - Abort signal.
     * @param {() => AsyncGenerator<StreamEntry>} generatorFn - Function that returns an async generator.
     * @param {Function} [onProgress] - Called with (progress, item).
     * @param {Function} [onError] - Called with (errorMessage, item).
     * @param {Function} [onComplete] - Called with (item) when done.
     * @returns {Promise<void>}
     */
    static process(signal: AbortSignal, generatorFn: () => AsyncGenerator<StreamEntry>, onProgress?: Function, onError?: Function, onComplete?: Function): Promise<void>;
}
import StreamEntry from './StreamEntry.js';
