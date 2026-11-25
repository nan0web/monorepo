import { ModelError } from '@nan0web/types'
import { ModelAsApp } from '@nan0web/ui'

/** @type {readonly string[]} */
export const CANONICAL_CIRCLES = [
	'7i',
	'kinship',
	'partner',
	'law',
	'community',
	'service',
	'inbox',
]

/** @type {readonly string[]} */
const DAY_ONE_FILES = [
	'i/README.md',
	'we/7i/family/todo.md',
	'we/inbox/README.md',
	'env/home/shopping.md',
]

/**
 * Converts soulId like "soul:yaro" into safe filename slug "soul-yaro".
 * @param {string} soulId
 * @returns {string}
 */
function toSlug(soulId) {
	return String(soulId || '')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

/**
 * Fractal contact book for 7iOS we/ circles and Triad project governance.
 */
export class FractalContactBookModel extends ModelAsApp {
	static UI = {
		errorNoDb: 'Database instance ($db) is required',
		errorInvalidCircle: 'Invalid circle: must be one of configured we/ circles',
		errorInvalidSoulId: 'soulId is required',
		errorTriadRule: 'Triad rule violation: partner project requires at least 3 core members',
	}

	static circles = {
		help: 'Allowed we/ circles (overridable via index config or model options)',
		default: CANONICAL_CIRCLES,
	}

	/**
	 * @param {Partial<FractalContactBookModel>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string[]} Allowed we/ circles */ this.circles
	}

	/**
	 * Resolves active we/ circles from root index document or model options.
	 * @returns {Promise<string[]>}
	 */
	async resolveCircles() {
		const rootIndex = await this.$db.loadDocument('index', null)
		if (Array.isArray(rootIndex?.circles) && rootIndex.circles.length > 0) {
			return rootIndex.circles.map(String)
		}
		return Array.isArray(this.circles) && this.circles.length > 0
			? this.circles.map(String)
			: [...CANONICAL_CIRCLES]
	}

	/**
	 * Registers a contact in one of configured we/ circles.
	 * @param {{ soulId: string, circle: string, name: string, devices?: string[], dryRun?: boolean }} input
	 * @returns {Promise<{ soulId: string, circle: string, name: string, devices: string[] }>}
	 */
	async addContact(input) {
		const { soulId, circle, name, devices = [], dryRun = false } = input || {}
		if (!soulId) {
			throw new ModelError({ soulId: FractalContactBookModel.UI.errorInvalidSoulId })
		}
		const allowed = await this.resolveCircles()
		if (!allowed.includes(circle)) {
			throw new ModelError({ circle: FractalContactBookModel.UI.errorInvalidCircle })
		}
		const contact = {
			soulId: String(soulId),
			circle: String(circle),
			name: String(name || soulId),
			devices: Array.isArray(devices) ? devices.map(String) : [],
		}
		if (!dryRun) {
			const uri = this.$db.normalize('we', circle, toSlug(soulId))
			await this.$db.saveDocument(uri, contact)
		}
		return contact
	}

	/**
	 * Creates a shared partner project enforcing the Triad Rule (N >= 3).
	 * @param {{ projectId: string, title: string, coreMembers: string[] }} input
	 * @returns {Promise<{ projectId: string, title: string, coreMembers: string[] }>}
	 */
	async createPartnerProject(input) {
		const { projectId, title, coreMembers = [] } = input || {}
		const uniqueMembers = Array.from(new Set(Array.isArray(coreMembers) ? coreMembers : []))
		if (uniqueMembers.length < 3) {
			throw new ModelError({ coreMembers: FractalContactBookModel.UI.errorTriadRule })
		}
		const project = {
			projectId: toSlug(projectId),
			title: String(title || projectId),
			coreMembers: uniqueMembers.map(String),
		}
		const uri = this.$db.normalize('we', 'partner', project.projectId, 'project')
		await this.$db.saveDocument(uri, project)
		return project
	}

	/**
	 * Bootstraps Day 1 Onboarding tree by copying template files from tourDir.
	 * @param {{ tourDir?: string, dryRun?: boolean }} [options]
	 * @returns {Promise<{ dryRun: boolean, created: string[], existing: string[] }>}
	 */
	async bootstrapDayOneTree(options = {}) {
		const { tourDir = 'docs/uk/tour/01', dryRun = false } = options
		const created = []
		const existing = []
		for (const relUri of DAY_ONE_FILES) {
			const stat = await this.$db.stat(relUri)
			if (stat && stat.exists) {
				existing.push(relUri)
				continue
			}
			const srcUri = this.$db.normalize(tourDir, relUri)
			const content = (await this.$db.loadDocument(srcUri, null)) || `# ${relUri}\n`
			if (!dryRun) {
				await this.$db.saveDocument(relUri, content)
			}
			created.push(relUri)
		}
		return { dryRun: Boolean(dryRun), created, existing }
	}
}
