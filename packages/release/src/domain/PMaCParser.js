import Markdown, {
	MDHeading1,
	MDHeading2,
	MDHeading3,
	MDTaskList,
	MDTable,
	MDTableRow,
	MDList,
	MDParagraph,
} from '@nan0web/markdown'
import {
	ReleaseModel,
	ReleaseMemberModel,
	ReleaseTaskModel,
	ReleaseParityModel,
	ReleaseIssueModel,
} from './models/index.js'

/**
 * Clean text from emoji, symbols, markdown formatting and trim.
 * @param {string} text
 * @returns {string}
 */
export function cleanSectionTitle(text) {
	return String(text || '')
		.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
		.replace(/^[#\s*_-]+|[#\s*_-]+$/g, '')
		.trim()
		.toLowerCase()
}

/**
 * Match section title against known synonyms in ReleaseModel.SECTIONS.
 * @param {string} headingText
 * @param {typeof ReleaseModel} ModelClass
 * @returns {string | null} Recognized section key or null
 */
export function identifySection(headingText, ModelClass = ReleaseModel) {
	const cleaned = cleanSectionTitle(headingText)
	if (!cleaned) return null

	for (const [sectionKey, synonyms] of Object.entries(ModelClass.SECTIONS)) {
		for (const synonym of synonyms) {
			const synCleaned = synonym.trim().toLowerCase()
			if (cleaned === synCleaned || cleaned.startsWith(synCleaned) || cleaned.endsWith(synCleaned)) {
				return sectionKey
			}
		}
	}
	return null
}

/**
 * Resolve external tracker URL for a task or issue ID using template URL.
 * Example: trackerUrl = "https://github.com/org/repo/issues/{id}", rawId = "[#142]" -> "https://github.com/org/repo/issues/142"
 * @param {string} id
 * @param {string} trackerTemplate
 * @returns {string}
 */
export function resolveTrackerUrl(id, trackerTemplate) {
	if (!trackerTemplate || !id) return ''
	const cleanId = String(id).replace(/^\[#?|\]$/g, '').trim()
	return trackerTemplate.replace(/\{id\}/g, cleanId)
}

/**
 * PMaCParser - Parses PMaC Release/Task specification documents into ReleaseModel instances.
 */
export class PMaCParser {
	/**
	 * @param {typeof ReleaseModel} [modelClass]
	 */
	constructor(modelClass = ReleaseModel) {
		this.ModelClass = modelClass
	}

	/**
	 * Parse markdown content into a ReleaseModel instance.
	 * @param {string} markdownContent
	 * @returns {ReleaseModel}
	 */
	parse(markdownContent) {
		const md = new Markdown(markdownContent)
		const frontmatter = md.vars || {}
		const elements = md.document?.children || []

		// 1. Identify H1 for version and title
		let version = ''
		let title = ''

		const h1 = elements.find((el) => el instanceof MDHeading1)
		if (h1) {
			const rawTitle = h1.content?.trim() || ''
			// Matches formats like: "# v0.1.0 — Core Release Engine" or "# v0.1.0 - Core Release" or "# v1.0.0"
			const h1Match = rawTitle.match(/^(v\d+\.\d+\.\d+(?:-[\w.]+)?)\s*(?:[—–-]\s*(.+))?$/i)
			if (h1Match) {
				version = h1Match[1]
				title = (h1Match[2] || '').trim()
			} else {
				// Fallback: check if starts with version
				const vMatch = rawTitle.match(/^(v\d+\.\d+\.\d+(?:-[\w.]+)?)/i)
				if (vMatch) {
					version = vMatch[1]
					title = rawTitle.slice(vMatch[0].length).replace(/^[—–-\s]+/, '').trim()
				} else {
					title = rawTitle
				}
			}
		}

		const trackerTemplate = frontmatter.tracker || ''

		// Build release data
		const releaseData = {
			version: frontmatter.version || version,
			title: frontmatter.title || title,
			status: frontmatter.status || 'todo',
			type: frontmatter.type || 'minor',
			epic: frontmatter.epic,
			sprint: frontmatter.sprint,
			tracker: trackerTemplate,
			summary: '',
			team: [],
			tasks: [],
			criteria: [],
			parity: [],
			issues: [],
			files: [],
			meta: { ...frontmatter },
		}

		// 2. Iterate through sections delimited by MDHeading2
		let currentSection = null
		let currentTaskGroup = ''

		for (const el of elements) {
			if (el instanceof MDHeading2) {
				currentSection = identifySection(el.content, this.ModelClass)
				currentTaskGroup = ''
				continue
			}

			if (el instanceof MDHeading3) {
				currentTaskGroup = el.content?.trim() || ''
				continue
			}

			if (!currentSection) continue

			if (currentSection === 'summary') {
				if (el instanceof MDParagraph) {
					const text = el.content?.trim()
					if (text) {
						releaseData.summary = releaseData.summary
							? `${releaseData.summary}\n\n${text}`
							: text
					}
				}
			} else if (currentSection === 'team') {
				this._parseTeamSection(el, releaseData.team)
			} else if (currentSection === 'tasks') {
				this._parseTasksSection(el, releaseData.tasks, currentTaskGroup, trackerTemplate)
			} else if (currentSection === 'criteria') {
				this._parseTasksSection(el, releaseData.criteria, currentTaskGroup, trackerTemplate)
			} else if (currentSection === 'parity') {
				this._parseParitySection(el, releaseData.parity)
			} else if (currentSection === 'issues') {
				this._parseIssuesSection(el, releaseData.issues)
			} else if (currentSection === 'artifacts') {
				this._parseArtifactsSection(el, releaseData.files)
			}
		}

		return new this.ModelClass(releaseData)
	}

	/**
	 * @private
	 */
	_parseTeamSection(el, teamList) {
		const items = []
		if (el instanceof MDList) {
			for (const child of el.children) {
				items.push(child.content?.trim() || '')
			}
		} else if (el.content) {
			const lines = el.content.split('\n')
			for (const line of lines) {
				const trimmed = line.trim()
				if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
					items.push(trimmed.slice(2).trim())
				}
			}
		}

		for (const item of items) {
			// Matches: "**Lead / Architect:** Олександр Снігірьов (@snigirev)"
			// or "**Посада:** Ім'я (@handle)"
			const match = item.match(/^\*\*([^*]+)\*\*\s*(.*)$/)
			if (match) {
				const role = match[1].replace(/:$/, '').trim()
				const rest = match[2].trim()
				const handleMatch = rest.match(/\(@([^)]+)\)/)
				const handle = handleMatch ? handleMatch[1].trim() : ''
				const name = rest.replace(/\(@[^)]+\)/, '').trim()
				teamList.push(new ReleaseMemberModel({ role, name, handle }))
			} else {
				teamList.push(new ReleaseMemberModel({ role: '', name: item, handle: '' }))
			}
		}
	}

	/**
	 * @private
	 */
	_parseTasksSection(el, tasksList, taskGroup, trackerTemplate) {
		const items = []
		if (el instanceof MDTaskList || el instanceof MDList) {
			for (const child of el.children) {
				items.push(child.content?.trim() || '')
			}
		} else if (el.content && el.content.includes('- [')) {
			const lines = el.content.split('\n')
			for (const line of lines) {
				const trimmed = line.trim()
				if (trimmed.startsWith('- [')) {
					items.push(trimmed.slice(2).trim())
				}
			}
		}

		for (const rawItem of items) {
			// e.g. "[x] [#101-1] Винести базову модель ReleaseModel у пакет @nan0web/release"
			// or "- [x] [#101-1] ..." or "[ ] [#101-3] ..."
			let line = rawItem
			if (line.startsWith('- ')) line = line.slice(2).trim()

			const boxMatch = line.match(/^\[([ xX])\]\s*(.*)$/)
			let isDone = false
			let text = line

			if (boxMatch) {
				isDone = boxMatch[1].toLowerCase() === 'x'
				text = boxMatch[2].trim()
			}

			// Extract task ID like [#101-1] or [101-1] or [CORE-101]
			let id = ''
			const idMatch = text.match(/^\[#?([A-Za-z0-9_-]+)\]\s*(.*)$/)
			if (idMatch) {
				id = idMatch[1]
				text = idMatch[2].trim()
			} else {
				// Fallback: derive ID from group or random
				id = `task-${tasksList.length + 1}`
			}

			// Check for notes or assignee or hours in parens/brackets
			let notes = ''
			if (taskGroup) {
				notes = taskGroup
			}

			tasksList.push(
				new ReleaseTaskModel({
					id,
					title: text,
					status: isDone ? 'done' : 'todo',
					notes,
				})
			)
		}
	}

	/**
	 * @private
	 */
	_parseParitySection(el, parityList) {
		let rows = []
		if (el instanceof MDTable) {
			rows = el.children || []
		} else if (el instanceof MDTableRow) {
			rows = [el]
		}
		if (rows.length === 0) return

		for (const row of rows) {
			const rowContent = row.content?.trim() || ''
			// Skip separator rows like | :--- | :---: |
			if (/^\|[\s|:-]+\|$/.test(rowContent)) continue

			const cells = rowContent
				.split('|')
				.map((c) => c.trim())
				.filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)

			// Skip header row
			if (cells.length >= 3) {
				if (cells[0].toLowerCase() === 'колекція' || cells[0].toLowerCase() === 'collection') {
					continue
				}
				const collection = cells[0].replace(/`/g, '')
				const expected = parseInt(cells[1], 10) || 0
				const actual = parseInt(cells[2], 10) || 0
				const statusText = cells[3] || ''
				const comment = cells[4] || ''
				const synced = statusText.includes('OK') || statusText.includes('✅') || expected === actual

				parityList.push(
					new ReleaseParityModel({
						collection,
						expected,
						actual,
						synced,
						comment,
					})
				)
			}
		}
	}

	/**
	 * @private
	 */
	_parseIssuesSection(el, issuesList) {
		const items = []
		if (el instanceof MDList) {
			for (const child of el.children) {
				items.push(child.content?.trim() || '')
			}
		} else if (el.content) {
			const lines = el.content.split('\n')
			for (const line of lines) {
				const trimmed = line.trim()
				if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
					items.push(trimmed.slice(2).trim())
				}
			}
		}

		for (const item of items) {
			// Check if this is a sub-detail line (e.g. "Джерело: `@nan0web/payload-release/admin.jsx:L85`" or "Source: ...")
			const sourceMatch = item.match(/^(?:Джерело|Source|File):\s*`?([^`]+)`?/i)
			if (sourceMatch && issuesList.length > 0) {
				const lastIssue = issuesList[issuesList.length - 1]
				lastIssue.source = sourceMatch[1].trim()
				lastIssue.file = sourceMatch[1].split(':')[0].trim()
				continue
			}

			// Example: "**[WARN-001]** (Performance) Файли розміром > 2MB не повинні відкриватися"
			const codeMatch = item.match(/^\*\*\[?([A-Za-z0-9_-]+)\]?\*\*\s*(.*)$/)
			let code = ''
			let rest = item
			if (codeMatch) {
				code = codeMatch[1]
				rest = codeMatch[2].trim()
			}

			let level = 'warning'
			const upperCode = code.toUpperCase()
			if (upperCode.includes('ERR') || upperCode.includes('BLOCK')) level = 'error'
			else if (upperCode.includes('INFO')) level = 'info'

			issuesList.push(
				new ReleaseIssueModel({
					code,
					message: rest,
					level,
				})
			)
		}
	}

	/**
	 * @private
	 */
	_parseArtifactsSection(el, filesList) {
		let rows = []
		if (el instanceof MDTable) {
			rows = el.children || []
		} else if (el instanceof MDTableRow) {
			rows = [el]
		}
		if (rows.length === 0) return

		for (const row of rows) {
			const rowContent = row.content?.trim() || ''
			if (/^\|[\s|:-]+\|$/.test(rowContent)) continue

			const cells = rowContent
				.split('|')
				.map((c) => c.trim())
				.filter((c, idx, arr) => idx > 0 && idx < arr.length - 1)

			if (cells.length >= 1) {
				if (cells[0].toLowerCase() === 'файл' || cells[0].toLowerCase() === 'file') {
					continue
				}
				const file = cells[0].replace(/`/g, '')
				const size = cells[1] || ''
				const hash = cells[2] ? cells[2].replace(/`/g, '') : ''
				const type = cells[3] || ''
				filesList.push({ file, size, hash, type })
			}
		}
	}

	/**
	 * Static shortcut to parse specification
	 * @param {string} markdownContent
	 * @returns {ReleaseModel}
	 */
	static parse(markdownContent) {
		return new PMaCParser().parse(markdownContent)
	}
}

