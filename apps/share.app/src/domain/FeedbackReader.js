import { Model } from './Models.js'

/**
 * Asynchronous feedback reader stream generator.
 */
export class FeedbackReader extends Model {
	static postId = {
		help: 'Target post ID to read feedback from',
		default: ''
	}
	static intervalMs = {
		help: 'Polling interval in milliseconds',
		default: 60000
	}

	/** @type {boolean} */
	isStopped = false
	/** @type {Set<string>} Cache of processed comment IDs */
	seenIds = new Set()

	/**
	 * @param {Partial<FeedbackReader> | Record<string, any>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Target post ID */ this.postId
		/** @type {number} Polling interval */ this.intervalMs
	}

	/**
	 * Asynchronous generator streaming new feedback comments.
	 * @yields {import('./Models.js').SocialAdapterFeedback}
	 */
	async *run() {
		const { adapter } = this._
		if (!adapter) {
			throw new Error('Adapter context is missing')
		}

		while (!this.isStopped) {
			try {
				const comments = await adapter.syncFeedback(this.postId)
				for (const comment of comments) {
					if (!this.seenIds.has(comment.id)) {
						this.seenIds.add(comment.id)
						yield comment
					}
				}
			} catch (err) {
				yield { error: err }
			}
			
			// Non-blocking delay
			await new Promise(resolve => setTimeout(resolve, this.intervalMs))
		}
	}

	stop() {
		this.isStopped = true
		this.seenIds.clear()
	}
}
