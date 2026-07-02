import { ShareAdapter, NotImplementedError } from './ShareAdapter.js'
export { NotImplementedError }
import { createLimits } from './Models.js'

/**
 * The base protocol for all Social Network adapters (e.g. YouTube, Telegram).
 */
export class SocialAdapter extends ShareAdapter {
	/**
	 * Platform-specific numeric limits.
	 * @returns {import('./Models.js').SocialAdapterLimits}
	 */
	get limits() {
		return createLimits()
	}

	/**
	 * @param {string} capId - Capability identifier to check
	 * @returns {boolean}
	 */
	can(capId) {
		return this.capabilities.some(cap => {
			const id = typeof cap === 'string' ? cap : cap?.id
			return id === capId
		})
	}

	/**
	 * Rollback or delete a published post if supported by the platform.
	 * @param {string} postId - The underlying platform's post ID.
	 * @returns {Promise<boolean>}
	 */
	async delete(postId) {
		if (!this.can('delete')) {
			throw new Error(`Adapter '${this.constructor.name}' does not support deleting posts.`)
		}
		throw new NotImplementedError('delete')
	}

	/**
	 * Fetches new feedback (comments, likes) for a given post.
	 * @param {string} postId
	 * @returns {Promise<import('./Models.js').SocialAdapterFeedback[]>}
	 */
	async syncFeedback(postId) {
		throw new NotImplementedError('syncFeedback')
	}

	/**
	 * Replies to a specific comment natively on the platform.
	 * @param {import('./Models.js').SocialAdapterTarget} target - Identifies the comment and network
	 * @param {string} text - Reply text
	 * @returns {Promise<{ id: string }>}
	 */
	async reply(target, text) {
		if (!this.can('reply')) {
			throw new Error(`Adapter '${this.constructor.name}' does not support replying.`)
		}
		throw new NotImplementedError('reply')
	}

	/**
	 * Edits an already published post on the platform.
	 * @param {string} postId - The platform's post ID to edit
	 * @param {import('./Models.js').SocialAdapterContent} content - New content
	 * @returns {Promise<any>}
	 */
	async update(postId, content) {
		if (!this.can('edit')) {
			throw new Error(`Adapter '${this.constructor.name}' does not support editing posts.`)
		}
		throw new NotImplementedError('update')
	}
}
