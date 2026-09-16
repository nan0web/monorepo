import { ModelAsApp, result, show } from '@nan0web/ui'
import { DashboardModel } from './Dashboard/DashboardModel.js'
import Scanner from '../Release/Scanner.js'

/**
 * StatusCommand - ModelAsApp Subcommand to display PM-as-Code dashboard and project inspector.
 */
export default class StatusCommand extends ModelAsApp {
	static alias = 'status'

	static UI = {
		title: 'status',
		help: 'Show release status dashboard or project inspector',
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
		/** @type {string} */ this.target
		/** @type {string} */ this.sort
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
	 */
	async *run() {
		const db = this._.db
		if (!db) {
			throw new Error('Database instance is required in options ({ db })')
		}

		let hasRegistry = false
		try {
			const regDoc = await db.loadDocument(this.registryFile || 'releases.txt', null)
			hasRegistry = regDoc !== null
		} catch {}

		if (hasRegistry || this.target || this.sort) {
			let gitTelemetry = null
			try {
				gitTelemetry = await import('../utils/nodejs/GitTelemetry.js')
			} catch {}
			const dashboard = new DashboardModel(
				{ registryFile: this.registryFile || 'releases.txt' },
				{ db, gitTelemetry }
			)
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
					yield show(`🔍 Project Inspector: #${matchedIndex + 1} ${matchedProj.name}@${matchedProj.version}`, 'info')
					yield show(
						`  • Path: ${matchedProj.path} | Branch: ${matchedProj.branch || 'main'} (${matchedProj.gitStatus || 'clean'})`,
						'info',
					)
					yield show(
						`  • State: [${(matchedProj.status || 'unknown').toUpperCase()}] | Hours: ${matchedProj.hours}h | Iterations: ${matchedProj.iterations} | RRS: ${matchedProj.rrs}`,
						'info',
					)

					yield show(`📋 Tasks & Checklist:`, 'info')
					let renderedTasksCount = 0
					if (matchedProj.releaseContent) {
						const lines = matchedProj.releaseContent.split('\n')
						for (const rawLine of lines) {
							const l = rawLine.trim()
							if (l.startsWith('- [x]') || l.startsWith('- [ ]') || l.startsWith('* [x]') || l.startsWith('* [ ]')) {
								yield show(`  ${l}`, 'info')
								renderedTasksCount++
							} else if (
								l.startsWith('### Done') ||
								l.startsWith('### InProgress') ||
								l.startsWith('### Todo') ||
								l.startsWith('### Draft')
							) {
								const icon = l.startsWith('### Done') ? '[x]' : '[ ]'
								const desc = l.replace(/^###\s+(?:Done|InProgress|Todo|Draft)\s+/, '')
								yield show(`  - ${icon} ${desc}`, 'info')
								renderedTasksCount++
							}
						}
					}

					if (renderedTasksCount === 0 && Array.isArray(matchedProj.tasks) && matchedProj.tasks.length > 0) {
						for (const t of matchedProj.tasks) {
							const icon = t.status === 'Done' ? '[x]' : '[ ]'
							yield show(`  - ${icon} ${t.content || t.slug}`, 'info')
						}
					}

					if (matchedProj.userContent) {
						yield show(`📝 User Metrics & Feedback (user.md):`, 'info')
						const userLines = matchedProj.userContent
							.split('\n')
							.map((l) => l.trim())
							.filter(
								(l) =>
									l.length > 0 &&
									!l.startsWith('---') &&
									!l.startsWith('name:') &&
									!l.startsWith('version:') &&
									!l.startsWith('locale:'),
							)
						for (const ul of userLines) {
							yield show(`  ${ul}`, 'info')
						}
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
			yield show(StatusCommand.UI.header.replace('{$file}', this.registryFile || 'releases.txt'), 'info')

			if (projects.length === 0) {
				yield show(StatusCommand.UI.noProjects.replace('{$file}', this.registryFile || 'releases.txt'), 'warn')
			} else {
				const colNum = '#'.padEnd(3)
				const colProj = 'Project'.padEnd(25)
				const colVer = 'Version'.padEnd(9)
				const colBranch = 'Branch'.padEnd(12)
				const colGit = 'Git'.padEnd(7)
				const colState = 'State'.padEnd(10)
				const colHours = 'Hours'.padEnd(7)
				const colIters = 'Iters'.padEnd(7)
				const colRRS = 'RRS'.padEnd(5)
				const colTasks = 'Tasks'

				const tableHeader = `┌─────┬───────────────────────────┬───────────┬──────────────┬─────────┬────────────┬─────────┬─────────┬───────┬───────┐`
				const headerRow = `│ ${colNum} │ ${colProj} │ ${colVer} │ ${colBranch} │ ${colGit} │ ${colState} │ ${colHours} │ ${colIters} │ ${colRRS} │ ${colTasks.padEnd(5)} │`
				const separator = `├─────┼───────────────────────────┼───────────┼──────────────┼─────────┼────────────┼─────────┼─────────┼───────┼───────┤`
				const tableFooter = `└─────┴───────────────────────────┴───────────┴──────────────┴─────────┴────────────┴─────────┴─────────┴───────┴───────┘`

				yield show(tableHeader, 'info')
				yield show(headerRow, 'info')
				yield show(separator, 'info')

				for (let i = 0; i < projects.length; i++) {
					const proj = projects[i]
					const statusTag = proj.status === 'wip' ? '[WIP]' : proj.status === 'closed' ? '[CLOSED]' : '[UNKNOWN]'
					const rowNum = String(i + 1).padEnd(3)
					const rowName = (proj.name || '').padEnd(25).slice(0, 25)
					const rowVer = (proj.version || '').padEnd(9).slice(0, 9)
					const rowBranch = (proj.branch || 'main').padEnd(12).slice(0, 12)
					const rowGit = (proj.gitStatus || 'clean').padEnd(7).slice(0, 7)
					const rowState = statusTag.padEnd(10)
					const rowHours = `${proj.hours}h`.padEnd(7)
					const rowIters = String(proj.iterations).padEnd(7)
					const rowRRS = String(proj.rrs).padEnd(5)
					const doneTasks = Array.isArray(proj.tasks) ? proj.tasks.filter((t) => t.status === 'Done').length : 0
					const totalTasks = Array.isArray(proj.tasks) ? proj.tasks.length : 0
					const rowTasks = `${doneTasks}/${totalTasks}`.padEnd(5)

					const rowStr = `│ ${rowNum} │ ${rowName} │ ${rowVer} │ ${rowBranch} │ ${rowGit} │ ${rowState} │ ${rowHours} │ ${rowIters} │ ${rowRRS} │ ${rowTasks} │`
					yield show(rowStr, proj.status === 'wip' ? 'warn' : 'info')
				}

				yield show(tableFooter, 'info')

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

		// Local package fallback
		const scanner = new Scanner(process.cwd())
		const statuses = scanner.status()

		yield show(`🛜 nan0release status`)
		for (const st of statuses) {
			yield show(
				`${st.version.padEnd(10)} | ${st.state.padEnd(6)} | Specs: ${st.specs.length}, Tests: ${st.tests.length}`,
			)
		}
		return result({ statuses })
	}
}
