/**
 * Registry for database document serialization formats.
 * Supports both global and instance-level format registrations.
 */
export default class FormatRegistry {
	/** @type {Map<string, (str: string, ext: string) => any>} */
	#loaders = new Map()

	/** @type {Map<string, (doc: any, ext: string) => string>} */
	#savers = new Map()

	/** @type {FormatRegistry} */
	static default = new FormatRegistry()

	constructor() {
		// Register built-in JSON and raw fallbacks
		this.register('.json', (str) => JSON.parse(str), (doc) => JSON.stringify(doc, null, 2))
		this.register('*', (str) => str, (doc) => String(doc))
	}

	/**
	 * Registers loader and saver functions for a specific extension.
	 * @param {string} ext - Extension, e.g., '.yaml' or '.md'
	 * @param {(str: string, ext: string) => any} loader
	 * @param {(doc: any, ext: string) => string} saver
	 */
	register(ext, loader, saver) {
		this.#loaders.set(ext, loader)
		this.#savers.set(ext, saver)
	}

	/**
	 * Resolves loader for given extension. Falls back to raw string.
	 * @param {string} ext
	 * @returns {(str: string, ext: string) => any}
	 */
	resolveLoader(ext) {
		return this.#loaders.get(ext) || /** @type {(str: string, ext: string) => any} */ (this.#loaders.get('*'))
	}

	/**
	 * Resolves saver for given extension. Falls back to string coercion.
	 * @param {string} ext
	 * @returns {(doc: any, ext: string) => string}
	 */
	resolveSaver(ext) {
		return this.#savers.get(ext) || /** @type {(doc: any, ext: string) => string} */ (this.#savers.get('*'))
	}
}
