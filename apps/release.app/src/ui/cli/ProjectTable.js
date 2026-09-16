/**
 * ProjectTable.js - Pure functional CLI renderer for Release projects table.
 */

/**
 * Render formatted ASCII table lines for dashboard projects
 * @param {Object} data
 * @param {Array<any>} data.projects
 * @param {Object} [data.summary]
 * @returns {string[]}
 */
export function renderProjectTable(data = {}) {
	const projects = data.projects || []
	const summary = data.summary || { totalProjects: 0, wipCount: 0, closedCount: 0, totalHours: 0, totalIterations: 0 }
	const lines = []

	if (projects.length === 0) {
		lines.push('No projects registered')
		return lines
	}

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

	lines.push(tableHeader)
	lines.push(headerRow)
	lines.push(separator)

	for (let i = 0; i < projects.length; i++) {
		const proj = projects[i]
		const statusTag = proj.status === 'wip' ? '[WIP]' : proj.status === 'closed' ? '[CLOSED]' : '[UNKNOWN]'
		const rowNum = String(i + 1).padEnd(3)
		const rowName = (proj.name || '').padEnd(25).slice(0, 25)
		const rowVer = (proj.version || '').padEnd(9).slice(0, 9)
		const rowBranch = (proj.branch || 'main').padEnd(12).slice(0, 12)
		const rowGit = (proj.gitStatus || 'clean').padEnd(7).slice(0, 7)
		const rowState = statusTag.padEnd(10)
		const rowHours = `${proj.hours ?? 0}h`.padEnd(7)
		const rowIters = String(proj.iterations ?? 0).padEnd(7)
		const rowRRS = String(proj.rrs ?? 0).padEnd(5)
		const doneTasks = Array.isArray(proj.tasks) ? proj.tasks.filter((t) => t.status === 'Done').length : 0
		const totalTasks = Array.isArray(proj.tasks) ? proj.tasks.length : 0
		const rowTasks = `${doneTasks}/${totalTasks}`.padEnd(5)

		const rowStr = `│ ${rowNum} │ ${rowName} │ ${rowVer} │ ${rowBranch} │ ${rowGit} │ ${rowState} │ ${rowHours} │ ${rowIters} │ ${rowRRS} │ ${rowTasks} │`
		lines.push(rowStr)
	}

	lines.push(tableFooter)
	return lines
}

export default renderProjectTable
