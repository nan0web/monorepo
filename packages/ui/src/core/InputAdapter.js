import Event from '@nan0web/event/oop'
import CancelError from './Error/CancelError.js'
import UiMessage from './Message/Message.js'

/**
 * @typedef {Object} AskOptions
 * @property {boolean} [silent] - Suppress logs or output.
 * @property {string} [title] - Custom title for the prompt.
 * @property {string} [hint] - Presentation hint (e.g., 'password', 'tree', 'markdown').
 * @property {any} [default] - Default value if no input is provided.
 * @property {Array<string|Object>} [options] - Array of options for select inputs.
 * @property {Record<string, any>} [UI] - Localization dictionary/overrides.
 * @property {string} [component] - Target specific component override.
 */
/** @typedef {import('./index.js').AskResponse} AskResponse */

/**
 * Abstract input adapter for UI implementations.
 *
 * @class InputAdapter
 * @extends Event
 */
export class InputAdapter extends Event {
	static CancelError = CancelError
	/** @returns {typeof CancelError} */
	get CancelError() {
		return /** @type {typeof InputAdapter} */ (this.constructor).CancelError
	}
	/**
	 * Starts listening for input and emits an `input` event.
	 *
	 * @returns {void}
	 */
	start() {
		this.emit('input', UiMessage.from({ body: 'Adapter started' }))
	}

	/**
	 * Stops listening for input. Default implementation does nothing.
	 *
	 * @returns {void}
	 */
	stop() {
		// Default implementation – does nothing
	}

	/**
	 * Checks whether the adapter is ready to receive input.
	 *
	 * @returns {boolean} Always true in base class.
	 */
	isReady() {
		return true
	}



	/**
	 * Helper to ask a question.
	 * @param {string|import('./Message/Message.js').default|any} question - Question to ask, Form instance, or AskIntent.
	 * @param {AskOptions} [options] - Additional options.
	 * @returns {Promise<AskResponse>}
	 */
	async ask(question, options) {
		throw new Error('ask() method must be implemented in subclass')
	}

	/**
	 * Generic selection prompt.
	 * @param {Object} config - Selection configuration.
	 * @returns {Promise<{ index?: number, value: string | null }>}
	 */
	async select(config) {
		throw new Error('select() method must be implemented in subclass')
	}
}

export default InputAdapter
