import assert from 'node:assert/strict'

/**
 * @typedef {Object} SpecAdapterOptions
 * @property {typeof import('node:assert/strict')} [assert] Custom assertion library (falls back to node:assert in Node runtime)
 */

export class SpecAdapter {
	/** @type {Array<object>} */
	stream
	/** @type {typeof import('node:assert/strict')} */
	assert

	/**
	 * @param {Array<object>} stream The remaining nan0 array without the first element.
	 * @param {SpecAdapterOptions} [options={}]
	 */
	constructor(stream, options = {}) {
		this.stream = stream
		this.assert = options.assert || assert
	}

	/**
	 * Helper to get the next step and assert type match.
	 * @param {string} intentType
	 */
	#popExpected(intentType) {
		const step = this.stream.shift()
		if (!step) {
			this.assert.fail(`Model yielded '${intentType}' intent, but Nan0Spec stream is exhausted (no more steps expected).`)
		}
		if (!(intentType in step)) {
			// Find what step type it actually is
			const actualType = Object.keys(step).find(k => !k.startsWith('$'))
			this.assert.fail(`Strict mismatch: Model yielded '${intentType}', but Nan0Spec stream expected '${actualType}'. Trace: ${JSON.stringify(step)}`)
		}
		return step
	}

	/**
	 * @param {import('../core/Intent.js').AskIntent} intent
	 */
	async ask(intent) {
		const step = this.#popExpected('ask')
		this.assert.equal(step.ask, intent.field, `Field mismatch on ask. Expected '${step.ask}', got '${intent.field}'`)
		return { value: step.$value, cancelled: false }
	}

	/**
	 * @param {import('../core/Intent.js').ShowIntent} intent
	 */
	async show(intent) {
		const step = this.#popExpected('show')
		if (step.show && typeof step.show === 'string') {
			const activeMessage = intent.message
			if (activeMessage && step.show !== '*' && step.show !== '') {
				this.assert.equal(activeMessage, step.show, `Show message mismatch`)
			}
		}
	}

	/**
	 * @param {import('../core/Intent.js').LogIntent} intent
	 */
	async log(intent) {
		const step = this.#popExpected('log')
		if (step.log && typeof step.log === 'string') {
			const activeMessage = intent.message
			if (activeMessage && step.log !== '*' && step.log !== '') {
				this.assert.equal(activeMessage, step.log, `Log message mismatch`)
			}
		}
	}

	/**
	 * @param {import('../core/Intent.js').ProgressIntent} intent
	 */
	async progress(intent) {
		this.#popExpected('progress')
	}

	/**
	 * @param {import('../core/Intent.js').RenderIntent} intent
	 */
	async render(intent) {
		const step = this.#popExpected('render')
		const activeComponent = intent.component
		this.assert.equal(activeComponent, step.render, `Render component mismatch. Expected '${step.render}'.`)
	}

	/**
	 * @param {import('../core/Intent.js').AgentIntent} intent
	 */
	async agent(intent) {
		const step = this.#popExpected('agent')
		this.assert.equal(step.agent, intent.task, `Agent task mismatch. Expected '${step.agent}'.`)
		
		return { success: step.$success !== false, files: step.$files, message: step.$message }
	}

	/**
	 * @param {import('../core/Intent.js').ResultIntent} intent
	 */
	async result(intent) {
		// Only pop result if there's a result recorded in the spec stream
		if (this.stream.length > 0 && typeof this.stream[0] === 'object' && 'result' in this.stream[0]) {
			const step = this.#popExpected('result')
			if (step.result !== undefined && step.result !== '*') {
				const actualData = intent?.data ?? intent
				this.assert.deepEqual(actualData, step.result, `Result object deep mismatch`)
			}
		}
	}
}
