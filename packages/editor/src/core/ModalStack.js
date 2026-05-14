/**
 * Manages a stack of editor models for recursive editing.
 * Handles depth limits and navigation between modal levels.
 */
export class ModalStack {
	#stack = []
	#maxDepth = 7
	#listeners = new Set()

	/**
	 * @param {object} options
	 * @param {number} [options.maxDepth=7] - Maximum recursion level
	 */
	constructor({ maxDepth = 7 } = {}) {
		this.#maxDepth = maxDepth
	}

	/**
	 * Current active editor model
	 * @returns {object|null}
	 */
	get current() {
		return this.#stack[this.#stack.length - 1] || null
	}

	/**
	 * Raw stack array
	 * @returns {Array}
	 */
	get items() {
		return [...this.#stack]
	}

	/**
	 * Current stack depth
	 * @returns {number}
	 */
	get depth() {
		return this.#stack.length
	}

	/**
	 * Push new model to the stack
	 * @param {object} model - EditorModel instance
	 * @returns {object} Pushed model
	 */
	push(model) {
		if (this.#stack.length >= this.#maxDepth) {
			throw new Error(`Editor recursion depth limit reached (${this.#maxDepth})`)
		}
		this.#stack.push(model)
		this.#notify()
		return model
	}

	/**
	 * Remove top model from stack and return it
	 * @returns {object|null}
	 */
	pop() {
		const removed = this.#stack.pop()
		this.#notify()
		return removed
	}

	/**
	 * Subscribe to stack changes
	 * @param {Function} fn - Callback function
	 * @returns {Function} Unsubscribe function
	 */
	onChange(fn) {
		this.#listeners.add(fn)
		return () => this.#listeners.delete(fn)
	}

	#notify() {
		this.#listeners.forEach((fn) => fn([...this.#stack]))
	}
}

export default ModalStack
