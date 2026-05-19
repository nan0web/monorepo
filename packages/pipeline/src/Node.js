/**
 * Abstract Node Model for Pipeline Architecture.
 * Follows OLMUI principles.
 */
export class Node {
	/** @type {string} Unique ID of the node instance in the pipeline */
	id
	/** @type {Object} Input data for the node */
	inputs = {}
	/** @type {Object} Output results of the node */
	outputs = {}

	/**
	 * @param {Object} [params={}]
	 * @param {string} [params.id]
	 * @param {Object} [params.inputs]
	 */
	constructor(params = {}) {
		this.id = params.id || this.constructor.name.toLowerCase()
		this.inputs = params.inputs || {}
	}

	/**
	 * Core execution method. Must be overridden by subclasses.
	 * @returns {AsyncGenerator<Object, any, unknown>}
	 */
	async *run() {
		yield this.step('Initializing node...')
		// Subclasses implement logic here
	}

	// --- UI Intents (Strict Contract) ---

	/**
	 * Indicates a new logical step in the process.
	 * @param {string} label 
	 */
	step(label) {
		return { type: 'step', label }
	}

	/**
	 * Reports progress of the current step.
	 * @param {number} value 
	 * @param {number} total 
	 */
	progress(value, total) {
		return { type: 'progress', value, total }
	}

	/**
	 * Simple log message.
	 * @param {string} message 
	 */
	log(message) {
		return { type: 'log', message }
	}

	/**
	 * Visualizes partial or intermediate data.
	 * @param {any} data 
	 */
	show(data) {
		return { type: 'show', data }
	}

	/**
	 * Requests input from the user/architect.
	 * @param {Object} schema 
	 */
	ask(schema) {
		return { type: 'ask', schema }
	}

	/**
	 * Final result of the node.
	 * @param {Object} data 
	 */
	result(data) {
		this.outputs = { ...this.outputs, ...data }
		return { type: 'result', data }
	}
}
