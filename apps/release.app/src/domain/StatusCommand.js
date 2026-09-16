import { Model } from '@nan0web/types'
import { show, progress, result, ModelAsApp } from '@nan0web/ui'
import { DashboardModel } from '@nan0web/release'
import { renderProjectTable, renderProjectInspector } from '../ui/cli/index.js'

/**
 * StatusCommand - Global Release Status CLI Subcommand.
 * Aggregates release telemetry from releases.txt and displays summary report or project inspector.
 */
export class StatusCommand extends ModelAsApp {
	static alias = 'status'

	static UI = { ...ModelAsApp.UI,
		...ModelAsApp.UI,
		title: 'Release Status Dashboard',
		loading: 'Scanning projects and aggregating release telemetry...',
		header: '📊 Global PM-as-Code Release Dashboard ({$file})',
		summaryHeader: '📈 Summary:',
		summaryRow1: '  Total Projects: {$total} | Active (WIP): {$wip} | Closed: {$closed}',
		summaryRow2: '  Total Hours: {$hours}h | Total Iterations: {$iterations}',
		noProjects: 'No projects registered in {$file}',
	}

	static registryFile = {
		help: 'Path to releases.txt registry file',
		default: 'releases.txt',
		type: 'string',
		alias: 'f',
	}

	static cwd = {
		help: 'Working directory (monorepo root where releases.txt lives)',
		default: '',
		type: 'string',
	}

	static target = {
		help: 'Target project # or name for detailed inspection',
		default: '',
		positional: true,
		type: 'string',
	}

	static sort = {
		help: 'Sort projects by column (hours, rrs, iters, state, name)',
		default: '',
		type: 'string',
		alias: 's',
	}

	/**
	 * @param {Partial<StatusCommand>} [data]
	 * @param {import('@nan0web/types').ModelOptions} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.registryFile
		/** @type {string} */ this.cwd
		/** @type {string} */ this.target
		/** @type {string} */ this.sort
	}

	/**
	 * Execute status aggregation and display
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { status: string, summary: any, projects: any[] }, any>}
	 */
	async *run() {
		const db = this._.db
		if (!db) {
			throw new Error('Database instance ({ db }) is required to execute StatusCommand')
		}

		yield progress(StatusCommand.UI.loading)

		const dashboard = new DashboardModel({ registryFile: this.registryFile }, { db })
		let { summary, projects } = await dashboard.aggregate()

		// 1. Sorting if requested
		if (this.sort) {
			const s = String(this.sort).toLowerCase()
			if (s === 'hours') {
				projects = [...projects].sort((a, b) => (b.hours || 0) - (a.hours || 0))
			} else if (s === 'rrs') {
				projects = [...projects].sort((a, b) => (b.rrs || 0) - (a.rrs || 0))
			} else if (s === 'iters' || s === 'iterations') {
				projects = [...projects].sort((a, b) => (b.iterations || 0) - (a.iterations || 0))
			} else if (s === 'name') {
				projects = [...projects].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
			} else if (s === 'state' || s === 'status') {
				const priority = { wip: 1, closed: 2, unknown: 3 }
				projects = [...projects].sort((a, b) => (priority[a.status] || 99) - (priority[b.status] || 99))
			}
		}

		// 2. Inspector mode if target is specified
		if (this.target) {
			const targetStr = String(this.target).trim()
			let matchedIndex = -1
			let matchedProj = null

			// If target is a number (1-based row index)
			const targetNum = parseInt(targetStr, 10)
			if (!isNaN(targetNum) && targetNum >= 1 && targetNum <= projects.length) {
				matchedIndex = targetNum - 1
				matchedProj = projects[matchedIndex]
			} else {
				matchedIndex = projects.findIndex(
					(p) =>
						p.name.toLowerCase() === targetStr.toLowerCase() ||
						p.path.toLowerCase() === targetStr.toLowerCase() ||
						p.name.toLowerCase().includes(targetStr.toLowerCase()) ||
						p.path.toLowerCase().includes(targetStr.toLowerCase()),
				)
				if (matchedIndex !== -1) {
					matchedProj = projects[matchedIndex]
				}
			}

			if (matchedProj) {
				const inspectorLines = renderProjectInspector(matchedProj, matchedIndex)
				for (const line of inspectorLines) {
					yield show(line, 'info')
				}
			} else {
				yield show(`❌ Project matching target "${this.target}" not found`, 'warn')
			}

			return result({
				status: 'ok',
				summary,
				projects,
			})
		}

		// 3. Normal Table mode
		yield show(StatusCommand.UI.header.replace('{$file}', this.registryFile), 'info')

		if (projects.length === 0) {
			yield show(StatusCommand.UI.noProjects.replace('{$file}', this.registryFile), 'warn')
		} else {
			const tableLines = renderProjectTable({ projects, summary })
			for (const line of tableLines) {
				const isWip = line.includes('[WIP]')
				yield show(line, isWip ? 'warn' : 'info')
			}

			yield show(StatusCommand.UI.summaryHeader, 'info')
			yield show(
				StatusCommand.UI.summaryRow1
					.replace('{$total}', String(summary.totalProjects))
					.replace('{$wip}', String(summary.wipCount))
					.replace('{$closed}', String(summary.closedCount)),
				'info',
			)
			yield show(
				StatusCommand.UI.summaryRow2
					.replace('{$hours}', String(summary.totalHours))
					.replace('{$iterations}', String(summary.totalIterations)),
				'info',
			)
		}

		return result({
			status: 'ok',
			summary,
			projects,
		})
	}
}

export default StatusCommand
