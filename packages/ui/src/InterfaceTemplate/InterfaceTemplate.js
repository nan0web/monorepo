/**
 * InterfaceTemplate — base class for defining new UI interfaces.
 *
 * Establishes the inheritance pattern for the "One Logic, Many UI" architecture.
 * Each UI interface (CLI, Web, Mobile, Chat, Audio) extends this template
 * and overrides the required methods.
 *
 * @example
 * class CliInterface extends InterfaceTemplate {
 *   render(data) { return formatForTerminal(data) }
 *   async ask(prompt) { return readlinePrompt(prompt) }
 * }
 *
 * @abstract
 */
export default class InterfaceTemplate {
	/**
	 * List of methods that MUST be overridden by concrete implementations.
	 * Used for documentation and runtime validation.
	 *
	 * @type {string[]}
	 */
	static requiredMethods = ['render', 'ask']

	constructor() {
		/**
		 * The name of this interface (e.g. 'cli', 'web', 'mobile').
		 * Override in subclass.
		 *
		 * @type {string}
		 */
		this.name = 'base'
	}

	/**
	 * Render data to the user through the interface.
	 * Must be overridden by each concrete implementation.
	 *
	 * @param {any} [data] - data to render
	 * @returns {any} rendered output (string for CLI, DOM for web, etc.)
	 * @throws {Error} if not overridden
	 */
	render(data) {
		throw new Error(
			`InterfaceTemplate.render() must be overridden by ${this.name || 'subclass'}. ` +
				'This is the primary output method for the interface.',
		)
	}

	/**
	 * Request input from the user through the interface.
	 * Must be overridden by each concrete implementation.
	 *
	 * @param {string} prompt - question or label for the input
	 * @param {object} [options] - options (type, choices, default, etc.)
	 * @returns {Promise<any>} user's response
	 * @throws {Error} if not overridden
	 */
	async ask(prompt, options = {}) {
		throw new Error(
			`InterfaceTemplate.ask() must be overridden by ${this.name || 'subclass'}. ` +
				'This is the primary input method for the interface.',
		)
	}

	/**
	 * Validate that all required methods have been overridden.
	 * Call this in the subclass constructor to get early feedback.
	 *
	 * @returns {string[]} list of missing method overrides (empty = valid)
	 */
	validate() {
		const missing = []
		for (const method of InterfaceTemplate.requiredMethods) {
			if (this[method] === InterfaceTemplate.prototype[method]) {
				missing.push(method)
			}
		}
		return missing
	}

	/**
	 * Get interface capabilities info.
	 *
	 * @returns {{ name: string, requiredMethods: string[], isComplete: boolean }}
	 */
	info() {
		const missing = this.validate()
		return {
			name: this.name,
			requiredMethods: [...InterfaceTemplate.requiredMethods],
			isComplete: missing.length === 0,
		}
	}
}

export { InterfaceTemplate }
