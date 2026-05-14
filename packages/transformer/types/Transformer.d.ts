export default Transformer
/**
 * Class representing a sequence of data transformers.
 * Allows adding, removing, and applying multiple transformers
 * sequentially for encoding and decoding data.
 */
declare class Transformer {
	/**
	 * Array of transformer objects, each may have encode and/or decode methods.
	 * @type {Array<Object>}
	 */
	transformers: Array<any>
	/**
	 * Applies all transformers' encode methods sequentially to the input data.
	 * @param {*} data - The data to encode.
	 * @returns {Promise<*>} - The encoded data after all transformations.
	 */
	encode(data: any): Promise<any>
	/**
	 * Applies all transformers' decode methods sequentially to the input data.
	 * @param {*} data - The data to decode.
	 * @returns {Promise<*>} - The decoded data after all transformations.
	 */
	decode(data: any): Promise<any>
	/**
	 * Adds a transformer object to the sequence.
	 * @param {Object} transformer - The transformer object, may have encode and/or decode methods.
	 */
	addTransformer(transformer: any): void
	/**
	 * Removes a transformer object from the sequence.
	 * @param {Object} transformer - The transformer object to remove.
	 */
	removeTransformer(transformer: any): void
}
