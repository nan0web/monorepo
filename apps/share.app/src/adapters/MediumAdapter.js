import { SocialAdapter } from '../domain/SocialAdapter.js'
import { SocialAdapterConfig, createLimits } from '../domain/Models.js'

// ─── MediumAdapterConfig ──────────────────────────────────────

export class MediumAdapterConfig extends SocialAdapterConfig {
	static token = {
		help: 'Medium Integration Token.',
		default: undefined,
	}
	static userId = {
		help: 'Medium User ID.',
		default: undefined,
	}

	/**
	 * @param {{ token: string, userId?: string } & Partial<import('../domain/Models.js').SocialAdapterConfig>} raw
	 */
	constructor(raw = {}) {
		super(raw)
		if (!raw.token) throw new Error('MediumAdapter requires config.token')

		/** @type {string} */
		this.token = raw.token
		/** @type {string|undefined} */
		this.userId = raw.userId
	}
}

// ─── MediumAdapter ────────────────────────────────────────────

/**
 * MediumAdapter
 *
 * Publishes stories/articles to Medium.
 */
export class MediumAdapter extends SocialAdapter {
	/**
	 * @param {ConstructorParameters<typeof MediumAdapterConfig>[0]} config
	 */
	constructor(config = {}) {
		super(config)
		/** @type {MediumAdapterConfig} */
		this.config = new MediumAdapterConfig(config)
	}

	get id() {
		return 'medium'
	}

	get capabilities() {
		return ['document', 'edit']
	}

	get limits() {
		return createLimits({ maxLength: 100000 })
	}

	async verify() {
		if (this.config.userId) return true
		const res = await fetch('https://api.medium.com/v1/me', {
			headers: {
				Authorization: `Bearer ${this.config.token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			}
		})
		if (!res.ok) return false
		const data = await res.json()
		this.config.userId = data.data.id
		return !!this.config.userId
	}

	/**
	 * @param {import('../domain/Models.js').SocialAdapterContent} content
	 * @returns {Promise<import('../domain/Models.js').SocialAdapterPublishResult>}
	 */
	async publish(content) {
		if (!this.config.userId) {
			const verified = await this.verify()
			if (!verified) throw new Error('Failed to verify Medium credentials')
		}

		const res = await fetch(`https://api.medium.com/v1/users/${this.config.userId}/posts`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.config.token}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				title: content.title || 'Untitled Post',
				contentFormat: 'markdown',
				content: content.text || '',
				tags: content.tags || [],
				publishStatus: 'draft'
			})
		})

		if (!res.ok) {
			throw new Error(`Medium publication failed: ${res.statusText}`)
		}

		const data = await res.json()
		return {
			id: data.data.id,
			url: data.data.url
		}
	}
}
