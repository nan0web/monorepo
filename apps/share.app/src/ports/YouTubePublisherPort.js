import fs from 'node:fs'
import { google } from 'googleapis'

/**
 * YouTubePublisherPort - Port for interacting with YouTube Data API v3.
 */
export class YouTubePublisherPort {
	/**
	 * @param {object} [options]
	 * @param {object} [options.apiClient] - Preconfigured or mocked googleapis youtube client.
	 * @param {string} [options.clientId]
	 * @param {string} [options.clientSecret]
	 * @param {string} [options.refreshToken]
	 */
	constructor(options = {}) {
		this.apiClient = options.apiClient || YouTubePublisherPort._createClient(options)
	}

	/**
	 * Creates OAuth2 Google YouTube client.
	 * @param {object} options
	 * @returns {object}
	 */
	static _createClient(options = {}) {
		const clientId = options.clientId || process.env.YOUTUBE_CLIENT_ID
		const clientSecret = options.clientSecret || process.env.YOUTUBE_CLIENT_SECRET
		const refreshToken = options.refreshToken || process.env.YOUTUBE_REFRESH_TOKEN

		if (!clientId || !clientSecret || !refreshToken) {
			return null
		}

		const auth = new google.auth.OAuth2(clientId, clientSecret)
		auth.setCredentials({ refresh_token: refreshToken })
		return google.youtube({ version: 'v3', auth })
	}

	/**
	 * Publishes a regular or unlisted video to YouTube.
	 * @param {object} params
	 * @param {string} params.filePath - Local path to the video file.
	 * @param {string} params.title - Video title.
	 * @param {string} [params.description=''] - Video description.
	 * @param {string[]} [params.tags=[]] - Video tags.
	 * @param {'public'|'unlisted'|'private'} [params.privacyStatus='unlisted']
	 * @param {string} [params.categoryId='22'] - Category (22 = People & Blogs).
	 * @returns {Promise<{ success: boolean, videoId: string, url: string, privacyStatus: string }>}
	 */
	async publishVideo({
		filePath,
		title,
		description = '',
		tags = [],
		privacyStatus = 'unlisted',
		categoryId = '22',
	}) {
		if (!this.apiClient) {
			throw new Error('YouTube API client is not configured. Missing OAuth2 credentials.')
		}

		const media = fs.existsSync(filePath) ? { body: fs.createReadStream(filePath) } : undefined

		const requestBody = {
			snippet: {
				title,
				description,
				tags,
				categoryId,
			},
			status: {
				privacyStatus,
			},
		}

		const res = await this.apiClient.videos.insert({
			part: ['snippet', 'status'],
			requestBody,
			media,
		})

		const videoId = res.data?.id
		return {
			success: true,
			videoId,
			url: `https://youtu.be/${videoId}`,
			privacyStatus,
		}
	}

	/**
	 * Publishes a short video, ensuring #Shorts hashtag is present.
	 * @param {object} params
	 * @param {string} params.filePath
	 * @param {string} params.title
	 * @param {string} [params.description='']
	 * @param {string[]} [params.tags=[]]
	 * @param {'public'|'unlisted'|'private'} [params.privacyStatus='public']
	 * @returns {Promise<{ success: boolean, videoId: string, url: string, privacyStatus: string }>}
	 */
	async publishShort({
		filePath,
		title,
		description = '',
		tags = [],
		privacyStatus = 'public',
	}) {
		const formattedTitle = title.includes('#Shorts') ? title : `${title} #Shorts`
		const formattedDesc = description.includes('#Shorts') ? description : `${description}\n\n#Shorts`

		return this.publishVideo({
			filePath,
			title: formattedTitle,
			description: formattedDesc,
			tags: [...new Set([...tags, 'Shorts', 'shorts'])],
			privacyStatus,
		})
	}
}
