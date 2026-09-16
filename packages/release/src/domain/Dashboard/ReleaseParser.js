/**
 * @typedef {Object} TaskItem
 * @property {string} content - Task title or description
 * @property {string} status - todo | InProgress | Done
 * @property {string} slug - Task slug / identifier
 * @property {'0' | '1' | '2' | '3'} [priority] - Numeric priority
 */

/**
 * Parse frontmatter YAML from markdown text
 * @param {*} input
 * @returns {Record<string, any>}
 */
export function parseFrontmatter(input) {
	const content = String(input || '')
	if (!content.trim()) return {}
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
	if (!match) return {}
	const res = {}
	for (const rawLine of match[1].split('\n')) {
		const line = rawLine.trim()
		if (!line || line.startsWith('#') || !line.includes(':')) continue
		const key = line.slice(0, line.indexOf(':')).trim()
		const val = line.slice(line.indexOf(':') + 1).trim().replace(/^['"](.*)['"]$/, '$1')
		res[key] = val
	}
	return res
}

/**
 * Normalize priority to numeric string '0' | '1' | '2' | '3'
 * @param {any} input
 * @returns {'0' | '1' | '2' | '3'}
 */
export function normalizePriority(input) {
	const str = String(input ?? '1').trim().toLowerCase()
	if (str === '0' || str === 'p0' || str.includes('urgent') || str.includes('high') || str.includes('критич')) return '0'
	if (str === '2' || str === 'p2' || str.includes('low') || str.includes('backlog') || str.includes('фон')) return '2'
	if (str === '3' || str === 'p3') return '3'
	return '1'
}

function detectPriority(text) {
	const m = text.match(/\b(p0|p1|p2|p3|urgent|high|med|medium|low)\b/i)
	if (!m) return '1'
	const p = m[1].toLowerCase()
	if (p === 'p0' || p === 'urgent' || p === 'high') return '0'
	if (p === 'p2') return '2'
	if (p === 'p3' || p === 'low') return '3'
	return '1'
}

function cleanTaskTitle(text) {
	return text.replace(/\[\s*\]\([^)]+\)/g, '').replace(/\[([^\]]+)\]$/, '').replace(/^\*\*|\*\*$/g, '').trim()
}

/**
 * Extract clean task items from release markdown
 * @param {*} input
 * @returns {TaskItem[]}
 */
export function extractTasks(input) {
	const content = String(input || '')
	if (!content.trim()) return []
	const tasks = []

	for (const rawLine of content.split('\n')) {
		const line = rawLine.trim()
		if (!line) continue

		const checkMatch = line.match(/^[-*+]?\s*(?:\[([ xX])\]|\d+\.\s*\[([ xX])\])\s*(.+)$/)
		if (checkMatch) {
			const isChecked = (checkMatch[1] || checkMatch[2] || '').toLowerCase() === 'x'
			const text = cleanTaskTitle(checkMatch[3])
			tasks.push({
				content: text,
				status: isChecked ? 'Done' : 'Todo',
				slug: text.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
				priority: detectPriority(checkMatch[3]),
			})
			continue
		}

		const headingMatch = line.match(/^###\s*(Done|InProgress|Todo|Draft)\s+(.+)$/i)
		if (headingMatch) {
			const statusWord = headingMatch[1].toLowerCase()
			const rawTitle = headingMatch[2].trim()
			const slugMatch = rawTitle.match(/\[([^\]]+)\]$/)
			const slug = slugMatch ? slugMatch[1] : ''
			const text = cleanTaskTitle(rawTitle)
			const status = statusWord === 'done' ? 'Done' : statusWord === 'inprogress' ? 'InProgress' : 'Todo'
			tasks.push({
				content: text,
				status,
				slug: slug || text.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
				priority: detectPriority(rawTitle),
			})
			continue
		}

		const numMatch = line.match(/^###\s*\d+\.\s*(.+)$/)
		if (numMatch) {
			const rawTitle = numMatch[1].trim()
			if (/^(Team|Tasks|Overview|Section|User Stories|Feedback|Acceptance Criteria)/i.test(rawTitle)) continue
			const text = cleanTaskTitle(rawTitle)
			if (text.length > 0) {
				tasks.push({
					content: text,
					status: 'Todo',
					slug: text.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
					priority: detectPriority(rawTitle),
				})
			}
		}
	}
	return tasks
}

/**
 * Calculate days remaining until deadline
 * @param {string} [deadlineStr]
 * @returns {number | null}
 */
export function calculateDaysRemaining(deadlineStr = '') {
	if (!deadlineStr) return null
	try {
		const target = new Date(deadlineStr)
		if (isNaN(target.getTime())) return null
		return Math.ceil((target.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
	} catch {
		return null
	}
}

/**
 * Parse user.md content for telemetry metrics (hours, iterations, RRS) across languages
 * @param {*} [input]
 * @returns {{ hours: number, iterations: number, rrs: number }}
 */
export function parseUserMetrics(input = '') {
	const content = String(input || '')
	if (!content.trim()) return { hours: 0, iterations: 0, rrs: 0 }

	let hours = 0, iterations = 0, rrs = 0
	const fm = parseFrontmatter(content)
	if (fm.hours || fm.spentHours || fm.time) hours = parseFloat(fm.hours || fm.spentHours || fm.time || '0') || 0
	if (fm.iterations || fm.iters || fm.runs) iterations = parseInt(fm.iterations || fm.iters || fm.runs || '0', 10) || 0
	if (fm.rrs || fm.score) rrs = parseInt(fm.rrs || fm.score || '0', 10) || 0

	for (const rawLine of content.split('\n')) {
		const line = rawLine.trim()
		if (!line || !line.includes(':')) continue
		const beforeColon = line.slice(0, line.indexOf(':')).toLowerCase()
		const numMatch = line.slice(line.indexOf(':') + 1).match(/([0-9]+(?:\.[0-9]+)?)/)
		if (!numMatch) continue
		const val = parseFloat(numMatch[1])

		if (hours === 0 && /(витрачений час|час розробки|time spent|development time|spent time|dev hours|hours|годин)/.test(beforeColon)) {
			hours = val
		} else if (iterations === 0 && /(кількість ітерацій|ітерацій|iteration count|test runs|refactor runs|iterations|runs)/.test(beforeColon)) {
			iterations = Math.round(val)
		} else if (rrs === 0 && /(rrs|release readiness score|фінальний бал|бал rrs|readiness score)/.test(beforeColon)) {
			rrs = Math.round(val)
		}
	}
	return { hours, iterations, rrs }
}

/**
 * Resolve priority from frontmatter or days remaining
 * @param {Record<string, any>} fm
 * @param {number | null} daysRemaining
 * @returns {'0' | '1' | '2' | '3'}
 */
export function resolvePriority(fm = {}, daysRemaining = null) {
	let priority = '1'
	const rawPrio = String(fm.priority || fm.prio || '').toLowerCase()
	if (rawPrio.includes('p0') || rawPrio.includes('high') || rawPrio.includes('urgent') || rawPrio.includes('критич')) priority = '0'
	else if (rawPrio.includes('p2') || rawPrio.includes('low') || rawPrio.includes('backlog') || rawPrio.includes('фон')) priority = '2'
	else if (rawPrio.includes('p3')) priority = '3'
	else if (rawPrio.includes('p1') || rawPrio.includes('med')) priority = '1'
	else if (daysRemaining !== null) {
		if (daysRemaining <= 3) priority = '0'
		else if (daysRemaining <= 7) priority = '1'
		else priority = '2'
	}
	return normalizePriority(priority)
}

/**
 * Sort tasks by criteria ('priority', 'status', 'alphabetical')
 * @param {TaskItem[]} [tasks=[]]
 * @param {'priority' | 'status' | 'alphabetical'} [criteria='priority']
 * @returns {TaskItem[]}
 */
export function sortTasks(tasks = [], criteria = 'priority') {
	const list = [...tasks]
	if (criteria === 'priority') {
		return list.sort((a, b) => parseInt(normalizePriority(a.priority), 10) - parseInt(normalizePriority(b.priority), 10))
	}
	if (criteria === 'status') {
		const weight = { Todo: 0, InProgress: 1, Done: 2 }
		return list.sort((a, b) => (weight[a.status] ?? 99) - (weight[b.status] ?? 99))
	}
	if (criteria === 'alphabetical') {
		return list.sort((a, b) => (a.content || '').localeCompare(b.content || ''))
	}
	return list
}

/**
 * Determine release status ('wip' | 'closed' | 'unknown')
 * @param {object} params
 * @returns {'wip' | 'closed' | 'unknown'}
 */
export function determineReleaseStatus({ fmStatus = '', hasSpec = false, hasTest = false, tasks = [], userStr = '', metrics = { hours: 0, rrs: 0 } } = {}) {
	const s = (fmStatus || '').toLowerCase()
	if (s === 'active' || s === 'wip') return 'wip'
	if (s === 'closed' || s === 'done' || s === 'sealed' || hasTest) return 'closed'
	if (hasSpec) return 'wip'
	if (tasks.length > 0) return tasks.every((t) => t.status === 'Done') ? 'closed' : 'wip'
	if (userStr.includes('status: active') || userStr.includes('status: wip')) return 'wip'
	if (userStr.includes('status: closed') || userStr.includes('status: done')) return 'closed'
	if (metrics.hours > 0 || metrics.rrs > 0 || userStr.length > 0) return 'wip'
	return 'unknown'
}
