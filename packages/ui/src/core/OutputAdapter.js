import Event from '@nan0web/event/oop'
import OutputMessage from './Message/OutputMessage.js'
import FormMessage from './Form/Message.js'

/**
 * Abstract output adapter for UI implementations.
 *
 * @class OutputAdapter
 * @extends Event
 */
class OutputAdapter extends Event {
	/**
	 * Renders a message to the user.
	 *
	 * @param {OutputMessage|FormMessage} message - Message to render.
	 * @throws {Error} If not overridden by a subclass.
	 */
	render(message) {
		throw new Error('render() must be implemented by subclass')
	}

	/**
	 * Shows progress of a long‑running operation.
	 *
	 * @param {number} progress - Progress value in range 0‑1.
	 * @param {Object} [metadata={}] - Additional metadata.
	 * @returns {void}
	 */
	progress(progress, metadata = {}) {
		this.render(
			OutputMessage.from({
				content: [],
				metadata: {
					...metadata,
					progress,
					elementType: 'progress',
				},
			}),
		)
	}

	/**
	 * Stops the output stream. Default implementation does nothing.
	 *
	 * @returns {void}
	 */
	stop() {
		// Default implementation – does nothing
	}
}

export default OutputAdapter
