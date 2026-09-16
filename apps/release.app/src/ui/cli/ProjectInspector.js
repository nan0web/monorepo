/**
 * ProjectInspector.js - Pure functional CLI renderer for single project inspection.
 */

/**
 * Render lines for detailed inspection of a project
 * @param {Object} project
 * @param {number} [index=0]
 * @returns {string[]}
 */
export function renderProjectInspector(project, index = 0) {
	if (!project) return ['Project not found']
	const lines = []

	lines.push(`🔍 Project Inspector: #${index + 1} ${project.name}@${project.version}`)
	lines.push(`  • Path: ${project.path} | Branch: ${project.branch || 'main'} (${project.gitStatus || 'clean'})`)
	lines.push(
		`  • State: [${(project.status || 'unknown').toUpperCase()}] | Priority: P${project.priority ?? '1'} | Hours: ${project.hours}h | Iterations: ${project.iterations} | RRS: ${project.rrs}`,
	)

	lines.push(`📋 Tasks & Checklist:`)
	let renderedTasksCount = 0
	if (project.releaseContent) {
		const rawLines = project.releaseContent.split('\n')
		for (const rawLine of rawLines) {
			const l = rawLine.trim()
			if (l.startsWith('- [x]') || l.startsWith('- [ ]') || l.startsWith('* [x]') || l.startsWith('* [ ]')) {
				lines.push(`  ${l}`)
				renderedTasksCount++
			} else if (
				l.startsWith('### Done') ||
				l.startsWith('### InProgress') ||
				l.startsWith('### Todo') ||
				l.startsWith('### Draft')
			) {
				const icon = l.startsWith('### Done') ? '[x]' : '[ ]'
				const desc = l.replace(/^###\s+(?:Done|InProgress|Todo|Draft)\s+/, '')
				lines.push(`  - ${icon} ${desc}`)
				renderedTasksCount++
			}
		}
	}

	if (renderedTasksCount === 0 && Array.isArray(project.tasks) && project.tasks.length > 0) {
		for (const t of project.tasks) {
			const icon = t.status === 'Done' ? '[x]' : '[ ]'
			lines.push(`  - ${icon} ${t.content || t.slug}`)
		}
	}

	if (project.userContent) {
		lines.push(`📝 User Metrics & Feedback (user.md):`)
		const userLines = project.userContent
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
			lines.push(`  ${ul}`)
		}
	}

	return lines
}

export default renderProjectInspector
