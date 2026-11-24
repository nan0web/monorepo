import { Model } from '@nan0web/types'
import { TaskModel } from './TaskModel.js'

/**
 * ProjectsMap (Model-as-Schema)
 * Loads projects.nan0 and resolves project keys from task text/hashtags/keywords.
 */
export class ProjectsMap extends Model {
	static entries = { type: 'object', default: {}, help: 'Project key to config mapping' }

	/**
	 * @param {Partial<ProjectsMap>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {Record<string, { dir: string, hashtags?: string[], keywords?: string[] }>} */
		this.entries = ProjectsMap.normalizeEntries(data.entries || {})
	}

	/**
	 * @param {Record<string, any>} raw
	 * @returns {Record<string, { dir: string, hashtags: string[], keywords: string[] }>}
	 */
	static normalizeEntries(raw) {
		/** @type {Record<string, { dir: string, hashtags: string[], keywords: string[] }>} */
		const out = {}
		for (const [key, val] of Object.entries(raw || {})) {
			if (typeof val === 'string') {
				out[key] = { dir: val, hashtags: [key.toLowerCase()], keywords: [] }
			} else if (val && typeof val === 'object') {
				out[key] = {
					dir: String(val.dir || ''),
					hashtags: Array.isArray(val.hashtags) ? val.hashtags.map((h) => String(h).toLowerCase()) : [key.toLowerCase()],
					keywords: Array.isArray(val.keywords) ? val.keywords.map((k) => String(k).toLowerCase()) : [],
				}
			}
		}
		return out
	}

	/**
	 * Load ProjectsMap from $db (projects.nan0).
	 * @param {import('@nan0web/db').default} db
	 * @returns {Promise<ProjectsMap>}
	 */
	static async load(db) {
		if (!db) return new ProjectsMap()
		const doc = await db.loadDocument('projects', null).catch(() => null)
		if (!doc || typeof doc !== 'object') return new ProjectsMap({}, { db })
		return new ProjectsMap({ entries: doc }, { db })
	}

	/**
	 * Resolve project key in order: [project:key] -> #hashtag -> keywords.
	 * @param {string | TaskModel} taskOrText
	 * @param {string} [domain='']
	 * @returns {string}
	 */
	resolveProject(taskOrText, domain = '') {
		const text = typeof taskOrText === 'string' ? taskOrText : taskOrText?.fullText || taskOrText?.title || ''
		const explicit = text.match(/\[project:([^\]]+)\]/i)
		if (explicit && this.entries[explicit[1].trim()]) {
			return explicit[1].trim()
		}

		const tags = TaskModel.extractHashtags(text)
		for (const [key, cfg] of Object.entries(this.entries)) {
			if (cfg.hashtags.some((h) => tags.includes(h))) return key
		}

		const haystack = `${text} ${domain}`.toLowerCase()
		for (const [key, cfg] of Object.entries(this.entries)) {
			if (cfg.keywords.some((kw) => haystack.includes(kw))) return key
		}
		return ''
	}

	/**
	 * Open resolved project directory in Antigravity IDE.
	 * @param {string} projectKey
	 * @param {import('../../adapters/SystemAdapter.js').SystemAdapter} system
	 * @returns {Promise<{ ok: boolean, project: string, dir?: string, reason?: string }>}
	 */
	async openInIde(projectKey, system) {
		const cfg = this.entries[projectKey]
		if (!cfg || !cfg.dir) {
			return { ok: false, project: projectKey, reason: 'project_not_found' }
		}
		await system.openIde(cfg.dir)
		return { ok: true, project: projectKey, dir: cfg.dir }
	}
}

export default ProjectsMap
