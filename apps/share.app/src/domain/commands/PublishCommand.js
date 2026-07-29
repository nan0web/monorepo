import { ModelAsApp } from '@nan0web/ui-cli'
import { YouTubeAdapter } from '../../adapters/YouTubeAdapter.js'
import { TelegramAdapter } from '../../adapters/TelegramAdapter.js'
import { MediumAdapter } from '../../adapters/MediumAdapter.js'
import { DummyAdapter } from '../DummyAdapter.js'
import { SocialAdapterContent } from '../Models.js'

/**
 * @typedef {object} PublishCommandOptions
 * @property {string} videoPath - Path to the video file to publish.
 * @property {string} title - Title for the publication.
 * @property {string} description - Description for the publication.
 * @property {string[]} [platforms] - Array of platforms to publish to (e.g., ['youtube']).
 * @property {string} [tags] - Comma-separated tags for SEO.
 * @property {string} [credentials] - Path to credentials file (YAML/nan0, default: credentials.yaml).
 * @property {string} [language] - Content language code (uk, en).
 */

export class PublishCommand extends ModelAsApp {
	static alias = 'publish'

	static videoPath = {
		type: 'string',
		required: true,
		help: 'Path to the video file to publish',
	}

	static title = {
		type: 'string',
		required: true,
		help: 'Title for the publication',
	}

	static description = {
		type: 'string',
		required: true,
		help: 'Description for the publication',
	}

	static platforms = {
		type: 'string',
		required: false,
		multiple: true,
		help: 'Platforms to publish to: youtube (default)',
	}

	static tags = {
		type: 'string',
		required: false,
		help: 'Comma-separated tags for SEO',
	}

	static credentials = {
		type: 'string',
		required: false,
		help: 'Path to credentials file (YAML/nan0, default: credentials.yaml)',
	}

	static language = {
		type: 'string',
		required: false,
		help: 'Content language code (uk, en)',
	}

	/** Map platform names to adapter classes */
	static ADAPTER_MAP = {
		youtube: YouTubeAdapter,
		telegram: TelegramAdapter,
		medium: MediumAdapter,
		dummy: DummyAdapter,
	}

	/**
	 * @param {PublishCommandOptions} data
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const db = this._.db
		const platforms = this.platforms?.length ? this.platforms : ['youtube']

		yield {
			type: 'progress',
			message: `Publishing "${this.title}" to ${platforms.join(', ')}...`,
		}

		// Load credentials from config file
		const credPath = this.credentials || 'credentials.yaml'
		let credentials = {}
		try {
			const creds = await db.fetch(`@app/${credPath}`)
			if (creds) credentials = creds
		} catch {
			yield { type: 'log', level: 'warn', message: `No credentials file found at ${credPath}. Trying env vars.` }
		}

		// Resolve video path via db if it's an @-path
		const videoPath = this.videoPath.startsWith('@') ? db.location(this.videoPath) : this.videoPath

		const tags = this.tags ? this.tags.split(',').map(t => t.trim()).filter(Boolean) : []
		const content = new SocialAdapterContent({
			text: this.description,
			title: this.title,
			video: videoPath,
			tags,
			lang: this.language || 'uk',
		})

		const results = []
		for (const platform of platforms) {
			yield { type: 'log', level: 'info', message: `Publishing to ${platform}...` }

			try {
				const AdapterClass = PublishCommand.ADAPTER_MAP[platform]
				if (!AdapterClass) {
					throw new Error(`Unknown platform: ${platform}. Supported: ${Object.keys(PublishCommand.ADAPTER_MAP).join(', ')}`)
				}

				// Resolve adapter config: platform-specific section in credentials, or env fallback
				const platformCreds = credentials[platform] || {}
				const adapter = new AdapterClass(platformCreds)

				// Verify before publishing
				const verified = await adapter.verify()
				if (!verified) {
					throw new Error(`Verification failed for ${platform}. Check credentials.`)
				}

				const result = await adapter.publish(content)
				results.push({ platform, success: true, id: result.id, url: result.url })
				yield { type: 'log', level: 'success', message: `Published to ${platform}: ${result.url || result.id}` }
			} catch (err) {
				results.push({ platform, success: false, error: err.message })
				yield { type: 'log', level: 'error', message: `Failed to publish to ${platform}: ${err.message}` }
			}
		}

		const allSucceeded = results.every(r => r.success)
		return {
			type: 'result',
			data: {
				success: allSucceeded,
				results,
				message: allSucceeded ? 'All publications completed.' : 'Some publications failed.',
			},
		}
	}
}
