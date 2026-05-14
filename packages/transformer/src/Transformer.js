/**
 * Class representing a sequence of data transformers.
 * Allows adding, removing, and applying multiple transformers
 * sequentially for encoding and decoding data.
 */
class Transformer {
	/**
	 * Creates a new Transformer instance.
	 */
	constructor() {
		/**
		 * Array of transformer objects, each may have encode and/or decode methods.
		 * @type {Array<Object>}
		 */
		this.transformers = []
	}

	/**
	 * Applies all transformers' encode methods sequentially to the input data.
	 * @param {*} data - The data to encode.
	 * @returns {Promise<*>} - The encoded data after all transformations.
	 */
	async encode(data) {
		let acc = data
		for (const transformer of this.transformers) {
			if (typeof transformer.encode === 'function') {
				acc = await transformer.encode(acc)
			}
		}
		return acc
	}

	/**
	 * Applies all transformers' decode methods sequentially to the input data.
	 * @param {*} data - The data to decode.
	 * @returns {Promise<*>} - The decoded data after all transformations.
	 */
	async decode(data) {
		let acc = data
		for (const transformer of this.transformers) {
			if (typeof transformer.decode === 'function') {
				acc = await transformer.decode(acc)
			}
		}
		return acc
	}

	/**
	 * Adds a transformer object to the sequence.
	 * @param {Object} transformer - The transformer object, may have encode and/or decode methods.
	 */
	addTransformer(transformer) {
		this.transformers.push(transformer)
	}

	/**
	 * Removes a transformer object from the sequence.
	 * @param {Object} transformer - The transformer object to remove.
	 */
	removeTransformer(transformer) {
		this.transformers = this.transformers.filter((t) => t !== transformer)
	}
}

export default Transformer
