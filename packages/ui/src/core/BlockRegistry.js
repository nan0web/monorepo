/**
 * Polymorphic Block Registry mapping Model constructors to UI View components/adapters.
 */
export class BlockRegistry {
	constructor() {
		/** @type {Map<Function, any>} */
		this.registry = new Map()
	}

	/**
	 * Register a Model constructor to a UI View component.
	 * @param {Function} modelClass
	 * @param {any} viewComponent
	 */
	register(modelClass, viewComponent) {
		this.registry.set(modelClass, viewComponent)
	}

	/**
	 * Retrieve a registered UI View component for a Model constructor or instance.
	 * @param {Function|object} target
	 * @returns {any}
	 */
	get(target) {
		const key = typeof target === 'function' ? target : target?.constructor
		return this.registry.get(key)
	}

	/**
	 * Check if a model is registered.
	 * @param {Function|object} target
	 * @returns {boolean}
	 */
	has(target) {
		const key = typeof target === 'function' ? target : target?.constructor
		return this.registry.has(key)
	}
}

export const blockRegistry = new BlockRegistry()
