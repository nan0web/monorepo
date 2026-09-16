import { Model } from '@nan0web/types'

/**
 * @typedef {Object} ProjectEntry
 * @property {string} path - Project relative or absolute path
 * @property {string} name - Package name from package.json or folder basename
 * @property {string} version - Package version from package.json
 */

/**
 * RegistryModel - PM-as-Code Project Registry manager.
 * Reads project paths from releases.txt and discovers package metadata.
 */
export class RegistryModel extends Model {
	static filePath = {
		help: 'Path to releases.txt registry file',
		default: 'releases.txt',
		type: 'string',
	}

	static projects = {
		help: 'List of registered projects',
		default: () => [],
		type: 'array',
	}

	static UI = {
		fileNotFound: 'Registry file {$path} not found',
		loadingProjects: 'Loading projects from registry {$path}...',
		projectsLoaded: 'Loaded {$count} projects from registry',
	}

	/**
	 * @param {Partial<RegistryModel>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Path to registry file */ this.filePath
		/** @type {ProjectEntry[]} List of registered projects */ this.projects
	}

	/**
	 * Parse raw content of releases.txt into array of clean paths
	 * @param {string} content
	 * @returns {string[]}
	 */
	static parsePaths(content = '') {
		if (typeof content !== 'string') return []
		return content
			.split('\n')
			.map((line) => {
				// Strip comments starting with #
				const withoutComment = line.split('#')[0]
				return withoutComment.trim()
			})
			.filter((line) => line.length > 0)
	}

	/**
	 * Load project entries from registry file using injected DB instance
	 * @returns {Promise<ProjectEntry[]>}
	 */
	async loadProjects() {
		const db = this._.db
		if (!db) {
			throw new Error('Database instance is required in options ({ db }) to load projects')
		}

		let content = await db.loadDocument(this.filePath, '')
		let rootPrefix = ''
		if (!content && this.filePath === 'releases.txt') {
			try {
				const parent2 = await db.loadDocument('../../releases.txt', '')
				if (parent2) {
					content = parent2
					rootPrefix = '../../'
				} else {
					const parent1 = await db.loadDocument('../releases.txt', '')
					if (parent1) {
						content = parent1
						rootPrefix = '../'
					}
				}
			} catch {
				// ignore
			}
		}

		const paths = RegistryModel.parsePaths(String(content || ''))

		/** @type {ProjectEntry[]} */
		const result = []

		for (const projectPath of paths) {
			const effectivePath = rootPrefix
				? projectPath === '.'
					? rootPrefix.slice(0, -1)
					: `${rootPrefix}${projectPath}`
				: projectPath
			const pkgPath = effectivePath === '.' ? 'package.json' : `${effectivePath.replace(/\/+$/, '')}/package.json`
			let pkg = null
			try {
				pkg = await db.loadDocument(pkgPath, null)
			} catch {
				pkg = null
			}

			const name = pkg?.name || projectPath
			const version = pkg?.version || '0.0.0'

			result.push({
				path: projectPath,
				name,
				version,
			})
		}

		this.projects = result
		return result
	}
}

export default RegistryModel
