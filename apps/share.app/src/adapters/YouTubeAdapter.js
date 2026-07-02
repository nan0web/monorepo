import { google } from 'googleapis'
import { SocialAdapter } from '../domain/SocialAdapter.js'
import { SocialAdapterConfig, createLimits } from '../domain/Models.js'

// ─── YouTubeAdapterConfig ────────────────────────────────────

export class YouTubeAdapterConfig extends SocialAdapterConfig {
	static clientId = {
		help: 'OAuth2 Client ID.',
		default: undefined,
	}
	static clientSecret = {
		help: 'OAuth2 Client Secret.',
		default: undefined,
	}
	static refreshToken = {
		help: 'OAuth2 Refresh Token.',
		default: undefined,
	}

	/**
	 * @param {{ clientId: string, clientSecret: string, refreshToken: string } & Partial<import('../domain/Models.js').SocialAdapterConfig>} raw
	 */
	constructor(raw = {}) {
		super(raw)
		if (!raw.clientId) throw new Error('YouTubeAdapter requires config.clientId')
		if (!raw.clientSecret) throw new Error('YouTubeAdapter requires config.clientSecret')
		if (!raw.refreshToken) throw new Error('YouTubeAdapter requires config.refreshToken')

		/** @type {string} */
		this.clientId = raw.clientId
		/** @type {string} */
		this.clientSecret = raw.clientSecret
		/** @type {string} */
		this.refreshToken = raw.refreshToken
	}
}

// ─── YouTubeAdapter ──────────────────────────────────────────

/**
 * YouTubeAdapter
 *
 * Publishes videos and shorts to YouTube via googleapis.
 */
export class YouTubeAdapter extends SocialAdapter {
	/**
	 * @param {ConstructorParameters<typeof YouTubeAdapterConfig>[0]} config
	 */
	constructor(config = {}) {
		super(config)
		/** @type {YouTubeAdapterConfig} */
		this.config = new YouTubeAdapterConfig(config)
	}

	get id() {
		return 'youtube'
	}

	get capabilities() {
		return ['video', 'media', 'delete']
	}

	get limits() {
		return createLimits({ maxLength: 5000 })
	}

	/**
	 * Creates OAuth2 client.
	 * @returns {any}
	 */
	_getAuthClient() {
		const oauth2Client = new google.auth.OAuth2(
			this.config.clientId,
			this.config.clientSecret,
			'postmessage'
		)
		oauth2Client.setCredentials({
			refresh_token: this.config.refreshToken
		})
		return oauth2Client
	}

	async verify() {
		const auth = this._getAuthClient()
		const tokenInfo = await auth.getTokenInfo(this.config.refreshToken)
		return !!tokenInfo.email
	}

	/**
	 * @param {import('../domain/Models.js').SocialAdapterContent} content
	 * @returns {Promise<import('../domain/Models.js').SocialAdapterPublishResult>}
	 */
	async publish(content) {
		if (!content.video) {
			throw new Error('YouTubeAdapter requires a video file path')
		}
		const auth = this._getAuthClient()
		const youtube = google.youtube({ version: 'v3', auth })

		// Resumable upload mock or call
		const res = await youtube.videos.insert({
			part: ['snippet', 'status'],
			requestBody: {
				snippet: {
					title: content.title || 'Untitled Video',
					description: content.text || '',
					tags: content.tags || []
				},
				status: {
					privacyStatus: 'unlisted'
				}
			},
			media: {
				body: content.video // ReadableStream or string filepath
			}
		})

		return {
			id: res.data.id || 'mock-yt-id',
			url: `https://www.youtube.com/watch?v=${res.data.id || 'mock-yt-id'}`
		}
	}
}
