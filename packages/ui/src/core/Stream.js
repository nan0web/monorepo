import StreamEntry from './StreamEntry.js'

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
	static createProcessor(signal, processorFn) {
		return async function* () {
			try {
				if (signal.aborted) {
					throw new DOMException('Aborted', 'AbortError')
				}
				const result = await processorFn()
				yield result
			} catch (/** @type {any} */ error) {
				if (error.name === 'AbortError') {
					yield StreamEntry.from({ done: true, cancelled: true })
				} else {
					yield StreamEntry.from({ error: error.message })
				}
			}
		}
	}

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
	static async process(signal, generatorFn, onProgress, onError, onComplete) {
		const iter = generatorFn()

		/** @type {Promise<never>} */
		const abortPromise = new Promise((_, reject) => {
			const onAbort = () => reject(new DOMException('The operation was aborted', 'AbortError'))
			if (signal.aborted) return onAbort()
			signal.addEventListener('abort', onAbort, { once: true })
		})

		try {
			while (true) {
				const { value: item, done } = await Promise.race([iter.next(), abortPromise])

				if (done) {
					if (item) onComplete?.(item)
					break
				}

				if (item.done) {
					onComplete?.(item)
					break
				}

				if (item.error) {
					onError?.(item.error, item)
				} else {
					onProgress?.(null, item)
				}
			}
		} catch (/** @type {any} */ error) {
			if (error.name === 'AbortError') {
				onComplete?.({ cancelled: true })
			} else {
				onError?.(error.message)
			}
			throw error
		}
	}
}
