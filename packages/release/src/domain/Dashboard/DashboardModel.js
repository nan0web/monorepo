import { ModelAsApp, progress, show, result } from '@nan0web/ui'
import { RegistryModel } from '../Registry/RegistryModel.js'
import {
	parseFrontmatter,
	calculateDaysRemaining,
	parseUserMetrics,
	normalizePriority,
	resolvePriority,
	sortTasks,
	determineReleaseStatus,
} from './ReleaseParser.js'
import {
	versionToPath,
	discoverReleases,
	documentExists,
	loadReleaseDoc,
} from './ReleaseDiscovery.js'

/**
 * @typedef {import('./ReleaseParser.js').TaskItem} TaskItem
 * @typedef {Object} ProjectDashboardEntry
 * @property {string} path - Relative project path
 * @property {string} name - Project name
 * @property {string} version - Current release version
 * @property {number} hours - Development hours spent
 * @property {number} iterations - Test runs / refactor iterations
 * @property {number} rrs - Release Readiness Score
 * @property {'wip' | 'closed' | 'unknown'} status - Release state
 * @property {TaskItem[]} tasks - Parsed tasks from release.md
 * @property {string} branch - Git branch name
 * @property {'clean' | 'dirty'} gitStatus - Git workspace status
 * @property {string} userContent - Raw user.md content
 * @property {string} releaseContent - Raw release.md content
 * @property {string} sourceDoc - Relative path to the parsed release document
 * @property {string} sourceUserDoc - Relative path to user.md
 * @property {string?} deadline - Project release deadline
 * @property {number?} daysRemaining - Days remaining until deadline
 * @property {string?} priority - Priority (0 | 1 | 2 | 3)
 * @property {number} [releasesCount] - Number of releases found
 * @property {number} [totalHours] - Total hours across all releases
 * @property {number} [totalIterations] - Total iterations across all releases
 * @property {Array<any>} [allReleases] - List of all releases for project
 *
 * @typedef {Object} DashboardSummary
 * @property {number} totalProjects - Total tracked projects
 * @property {number} totalHours - Sum of hours across projects
 * @property {number} totalIterations - Sum of iterations
 * @property {number} wipCount - Active WIP releases
 * @property {number} closedCount - Closed releases
 * @property {number} [totalReleases] - Total releases counted
 */

/**
 * DashboardModel - Aggregates release telemetry, tasks and readiness across projects.
 */
export class DashboardModel extends ModelAsApp {
	static registryFile = {
		help: 'Path to releases.txt registry file',
		default: 'releases.txt',
		type: 'string',
	}
	static summary = {
		help: 'Aggregated metrics summary',
		default: { totalProjects: 0, totalHours: 0, totalIterations: 0, wipCount: 0, closedCount: 0 },
		type: 'object',
	}
	static projects = { help: 'List of projects with metrics', default: () => [], type: 'array' }
	static UI = {
		aggregating: 'Aggregating release metrics for all projects...',
		done: 'Dashboard aggregation complete: {$total} projects scanned',
	}

	/**
	 * @param {Partial<DashboardModel>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions & { gitTelemetry?: any }>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Path to releases.txt registry file */ this.registryFile
		/** @type {DashboardSummary} Aggregated metrics summary */ this.summary
		/** @type {ProjectDashboardEntry[]} List of projects with metrics */ this.projects
		/** @type {any} Optional git telemetry adapter */
		this._gitTelemetry = options.gitTelemetry ?? null
	}

	static parseUserMetrics = parseUserMetrics
	static normalizePriority = normalizePriority
	static sortTasks = sortTasks
	static versionToPath = versionToPath

	/**
	 * Canonical OLMUI Generator: Yields progress, show, and returns result.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		yield progress(this.constructor.UI.aggregating)
		for await (const p of this.aggregateStream()) {
			yield progress(`${p.project} (${p.current}/${p.total})`)
		}
		const t = this._?.t
		const doneMsg = t
			? t(this.constructor.UI.done, { total: this.projects.length })
			: this.constructor.UI.done.replace('{$total}', String(this.projects.length))
		yield show(doneMsg, 'success')
		return result({ summary: this.summary, projects: this.projects })
	}

	/**
	 * Programmatic aggregation helper
	 * @param {Function} [onProgress]
	 * @returns {Promise<{ summary: DashboardSummary, projects: ProjectDashboardEntry[] }>}
	 */
	async aggregate(onProgress) {
		for await (const p of this.aggregateStream()) {
			if (typeof onProgress === 'function') onProgress(p.current, p.total, p.project)
		}
		return { summary: this.summary, projects: this.projects }
	}

	async *aggregateStream() {
		const db = this.$db
		const gitTelem = this._gitTelemetry

		const registry = new RegistryModel({ filePath: this.registryFile }, { db })
		const registeredProjects = await registry.loadProjects()

		const projectEntries = []
		let totalHours = 0,
			totalIterations = 0,
			wipCount = 0,
			closedCount = 0
		const totalProjects = registeredProjects.length
		let currentIdx = 0

		for (const proj of registeredProjects) {
			currentIdx++
			yield { current: currentIdx, total: totalProjects, project: proj.name || proj.path }

			const projectRoot = proj.path === '.' ? '' : `${proj.path.replace(/\/+$/, '')}/`
			const discovered = await discoverReleases(db, projectRoot)

			if (discovered.length === 0) {
				const gitInfo = gitTelem?.getGitInfo ? gitTelem.getGitInfo(proj.path) : { branch: 'main', gitStatus: 'clean' }
				projectEntries.push(this.#createEmptyEntry(proj, gitInfo))
				continue
			}

			const primaryRel = discovered[0]
			const effectiveVersion = primaryRel.version
			const matchedReleaseDir = primaryRel.path

			let userContent = ''
			const matchedUserDoc = `${matchedReleaseDir}/user.md`
			try {
				userContent = (await db.loadDocument(matchedUserDoc, '')) || ''
			} catch {}

			const metrics = parseUserMetrics(String(userContent || ''))
			if (metrics.hours === 0 && metrics.iterations === 0 && gitTelem?.getGitCommitTelemetry) {
				const telem = gitTelem.getGitCommitTelemetry(proj.path, matchedReleaseDir)
				if (telem?.hours > 0) {
					metrics.hours = telem.hours
					metrics.iterations = telem.iterations
				}
			}

			const { releaseContent, sourceDoc, tasks } = await loadReleaseDoc(db, matchedReleaseDir)
			const fm = parseFrontmatter(releaseContent || userContent)
			const deadline = fm.deadline || null
			const daysRemaining = calculateDaysRemaining(deadline)
			const priority = resolvePriority(fm, daysRemaining)

			const hasSpec = await documentExists(db, `${matchedReleaseDir}/task.spec.js`)
			const hasTest = await documentExists(db, `${matchedReleaseDir}/task.test.js`)
			const status = determineReleaseStatus({
				fmStatus: fm.status,
				hasSpec,
				hasTest,
				tasks,
				userStr: String(userContent || ''),
				metrics,
			})

			if (status === 'wip') wipCount++
			else if (status === 'closed') closedCount++

			const { allReleases, projectTotalHours, projectTotalIterations } =
				await this.#scanAllReleases(db, discovered, metrics)
			totalHours += projectTotalHours
			totalIterations += projectTotalIterations

			const gitInfo = gitTelem?.getGitInfo ? gitTelem.getGitInfo(proj.path) : { branch: 'main', gitStatus: 'clean' }
			projectEntries.push({
				path: proj.path,
				name: proj.name,
				version: effectiveVersion,
				hours: metrics.hours,
				iterations: metrics.iterations,
				totalHours: Math.round(projectTotalHours * 10) / 10,
				totalIterations: projectTotalIterations,
				releasesCount: Math.max(discovered.length, 1),
				allReleases,
				rrs: metrics.rrs,
				status,
				tasks,
				branch: gitInfo.branch,
				gitStatus: gitInfo.gitStatus,
				userContent: String(userContent || ''),
				releaseContent: String(releaseContent || ''),
				sourceDoc:
					sourceDoc || `${projectRoot}releases/${versionToPath(effectiveVersion)}/release.md`,
				sourceUserDoc:
					matchedUserDoc || `${projectRoot}releases/${versionToPath(effectiveVersion)}/user.md`,
				deadline,
				daysRemaining,
				priority,
			})
		}

		this.summary = {
			totalProjects: registeredProjects.length,
			totalReleases: projectEntries.reduce((sum, p) => sum + (p.releasesCount || 1), 0),
			totalHours: Math.round(totalHours * 10) / 10,
			totalIterations,
			wipCount,
			closedCount,
		}
		this.projects = projectEntries
		return { summary: this.summary, projects: projectEntries }
	}

	#createEmptyEntry(proj, gitInfo) {
		return {
			name: proj.name,
			version: proj.version || '0.0.0',
			path: proj.path,
			status: 'unknown',
			hours: 0,
			iterations: 0,
			rrs: 0,
			branch: gitInfo.branch,
			gitStatus: gitInfo.gitStatus,
			tasks: [],
			deadline: null,
			daysRemaining: null,
			priority: '1',
			releasesCount: 0,
			totalHours: 0,
			totalIterations: 0,
			allReleases: [],
			sourceDoc: '',
			sourceUserDoc: '',
			userContent: '',
			releaseContent: '',
		}
	}

	async #scanAllReleases(db, discovered, primaryMetrics) {
		let projectTotalHours = 0,
			projectTotalIterations = 0
		const allReleases = []

		for (const rel of discovered) {
			let relUser = ''
			try {
				relUser = (await db.loadDocument(`${rel.path}/user.md`, '')) || ''
			} catch {}
			const rm = parseUserMetrics(String(relUser || ''))
			projectTotalHours += rm.hours
			projectTotalIterations += rm.iterations

			const {
				releaseContent: relDocContent,
				sourceDoc: relDocPath,
				tasks: relTasks,
			} = await loadReleaseDoc(db, rel.path)
			const relFm = parseFrontmatter(relDocContent || relUser)
			const hasRelSpec = await documentExists(db, `${rel.path}/task.spec.js`)
			const hasRelTest = await documentExists(db, `${rel.path}/task.test.js`)

			const relStatus = determineReleaseStatus({
				fmStatus: relFm.status,
				hasSpec: hasRelSpec,
				hasTest: hasRelTest,
				tasks: relTasks,
				userStr: String(relUser || ''),
				metrics: rm,
			})

			allReleases.push({
				version: rel.version,
				path: rel.path,
				hours: rm.hours,
				iterations: rm.iterations,
				rrs: rm.rrs,
				status: relStatus,
				tasks: relTasks,
				sourceDoc: relDocPath,
			})
		}

		if (projectTotalHours === 0 && primaryMetrics.hours > 0)
			projectTotalHours = primaryMetrics.hours
		if (projectTotalIterations === 0 && primaryMetrics.iterations > 0)
			projectTotalIterations = primaryMetrics.iterations
		return { allReleases, projectTotalHours, projectTotalIterations }
	}
}
