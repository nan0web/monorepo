export default MailDB
declare class MailDB extends DB {
	/**
	 * Finds a value in an object by key or nested key path.
	 * @param {string} key - The key or nested key path (e.g. "user.name").
	 * @param {Object} obj - The object to search in.
	 * @returns {*} The found value or undefined.
	 */
	static findNestedElement(key: string, obj: any): any
	/**
	 * Asynchronously transforms an object based on a configuration object. The transformation can include
	 * modifying values, applying functions, and resolving file paths based on a provided directory.
	 *
	 * @async
	 * @param {Object} source - The source object to be transformed.
	 * @param {Object} config - The configuration object that defines how to transform the source object.
	 *                          Keys in the config object correspond to keys in the source object, and values
	 *                          define how the transformation occurs.
	 *                          - If the value is a string starting with '.', it is treated as a file path
	 *                            relative to the `dir` option and is required.
	 *                          - If the value is an array, the first element must be a function or a file path
	 *                            (resolved as a module if it starts with '.'). The rest are passed as arguments to the function.
	 *                          - If the value is an object with a `$input` property, it selects a value from the source object
	 *                            or generated object by the key specified in `$input`.
	 *                          - If the value is an object with a `$ref` property, it selects a reference from the source object
	 *                            or generated object using the key specified in `$ref`.
	 *                          - If the value is an object with a `$ref` property starting with '.', it treats it as a file path
	 *                            relative to the `dir` option and loads the file content as the value.
	 * @param {Object} [opts] - Optional settings for the transformation process.
	 * @param {string|null} [opts.dir=null] - The base directory for resolving file paths.
	 * @param {Object} [opts.formats={}] - Format handlers for different file extensions.
	 * @param {Function} [opts.onError=(err, item) => {}] - Error handler for handling transformation errors.
	 *                          It receives the error message and the current item being processed.
	 * @returns {Promise<Object>} - The transformed object.
	 */
	transform(
		source: any,
		config: any,
		opts?:
			| {
					dir?: string | null | undefined
					formats?: any
					onError?: Function | undefined
			  }
			| undefined,
	): Promise<any>
	/**
	 * Loads value from reference
	 * @private
	 * @param {object} item - Target object
	 * @param {object} value - Configuration value with $ref property
	 * @param {object} source - Source object
	 * @param {string|null} dir - Base directory
	 * @param {object} formats - Format handlers for different file extensions
	 * @returns {Promise<any>} - Referenced value
	 */
	private loadFromReference
}
import DB from '@nan0web/db-fs'
