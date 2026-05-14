import Markdown, { MDElement, MDHeading1, MDHeading2, MDHeading3 } from '@nan0web/markdown'
import Person from './Person.js'

class ReleaseDocument extends Markdown {
	/** @type {Person[]} */
	team
	/** @type {Map<string, Person[]>} */
	roles
	/** @type {string} */
	version
	/** @type {Date | undefined} */
	date

	/**
	 * @param {Object} options
	 * @param {Array} [options.team] - Release team members
	 * @param {Map | Array} [options.roles] - Release roles map with team members
	 * @param {string} [options.version] - Release version
	 * @param {string} [options.date] - Release date
	 */
	constructor(options = {}) {
		super()
		const { team = [], roles = new Map(), version = '', date } = options
		this.version = String(version)
		this.date = date ? new Date(date) : undefined
		this.team = team.map((t) => Person.from(t))
		this.roles = new Map(roles)
	}

	/**
	 * Parse release document content
	 * Extracts version and date from H1 heading
	 * @param {string} input - Markdown content
	 * @returns {MDElement[]}
	 */
	parse(input) {
		const result = super.parse(input)

		const h1s = this.document.filter((el) => el instanceof MDHeading1)
		if (h1s.length !== 1) {
			throw new TypeError('Release document must have exactly one H1 heading with version and date')
		}

		const h1Content = h1s[0].content ?? ''
		const [versionPart, ...dateParts] = h1Content.split(' - ')
		this.version = versionPart.trim()
		this.date = new Date(dateParts.join(' - ').trim())

		const sections = []
		/** @type {{title: string, tasks: Array} | null} */
		let currentSection = null
		for (const el of result) {
			if (el instanceof MDHeading2) {
				currentSection = {
					title: el.content.trim(),
					tasks: [],
				}
				sections.push(currentSection)
			} else if (el instanceof MDHeading3 && currentSection) {
				const content = el.content.trim()
				const statusMatch = content.match(/^(\w+)\s*(.+)$/)
				const slugMatch = content.match(/\[([^\]]+)\]$/)

				let status = 'todo'
				let taskContent = content
				let slug = ''

				if (statusMatch) {
					status = statusMatch[1]
					taskContent = statusMatch[2]
				}

				if (slugMatch) {
					slug = slugMatch[1]
					taskContent = taskContent.replace(/\[([^\]]+)\]$/, '').trim()
				}

				currentSection.tasks.push({
					content: taskContent,
					status: status,
					slug: slug,
				})
			}
		}

		return result
	}

	/**
	 * @param {*} input
	 * @returns {ReleaseDocument}
	 */
	static from(input) {
		if (input instanceof ReleaseDocument) return input
		if (typeof input === 'string') {
			const doc = new ReleaseDocument()
			doc.parse(input)
			return doc
		}
		return new ReleaseDocument(input)
	}
}

export default ReleaseDocument
