/**
 * Represents an entry in a stream with value, completion status, cancellation status, and error message.
 */
export default class StreamEntry {
	/**
	 * Creates a new StreamEntry instance.
	 * @param {Object} [input={}] - Input object to initialize the stream entry.
	 * @param {any} [input.value] - The value for the stream entry.
	 * @param {boolean} [input.done] - Whether the stream entry is completed.
	 * @param {boolean} [input.cancelled] - Whether the stream entry is cancelled.
	 * @param {string} [input.error] - Error message for the stream entry.
	 */
	constructor(input = {}) {
		const {
			value = undefined,
			done = false,
			cancelled = false,
			error = '',
		} = input
		/**
		 * The value of the stream entry.
		 * @type {any}
		 */
		this.value = value
		/**
		 * Indicates if the stream entry is done (completed).
		 * @type {boolean}
		 */
		this.done = Boolean(done)
		/**
		 * Indicates if the stream entry has been cancelled.
		 * @type {boolean}
		 */
		this.cancelled = Boolean(cancelled)
		/**
		 * Error message associated with the stream entry.
		 * @type {string}
		 */
		this.error = String(error)
	}

	/**
	 * Creates a StreamEntry instance from the given input.
	 * @param {any} input - The input to create a StreamEntry from.
	 * @returns {StreamEntry} A new or existing StreamEntry instance.
	 */
	static from(input) {
		if (input instanceof StreamEntry) return input
		return new StreamEntry(input)
	}
}
