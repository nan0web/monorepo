/**
 * @typedef {object} StreamConfig
 * @property {string} id
 * @property {string} [name]
 * @property {string | string[]} [tags]
 * @property {string} [action]
 * @property {Array<Record<string, any>>} [destinations]
 * @property {string[]} [translate]
 */

/**
 * @typedef {object} UnknownTagReportItem
 * @property {string} tag
 * @property {number} line
 * @property {string} section
 * @property {string} [file]
 */

/**
 * @typedef {object} TagValidationResult
 * @property {boolean} valid
 * @property {UnknownTagReportItem[]} unknownTags
 * @property {string} report
 */

/**
 * TagLinter — validates all document hashtags against configured stream tags.
 * Never fails on the first unknown tag; collects a complete structured report.
 */
export class TagLinter {
	/** @type {Set<string>} */
	registeredTags

	/**
	 * @param {object} [options]
	 * @param {StreamConfig[]} [options.streams]
	 */
	constructor({ streams = [] } = {}) {
		this.registeredTags = new Set()
		for (const stream of streams) {
			const normalized = TagLinter.normalizeTags(stream.tags)
			for (const tag of normalized) {
				this.registeredTags.add(tag)
			}
		}
	}

	/**
	 * Normalizes a space-separated string, array, or Set of tags into a Set of lowercase `#tag` strings.
	 * @param {string | string[] | Set<string> | undefined} input
	 * @returns {Set<string>}
	 */
	static normalizeTags(input) {
		/** @type {Set<string>} */
		const result = new Set()
		if (!input) return result

		const items = Array.isArray(input) || input instanceof Set
			? Array.from(input)
			: String(input).split(/[\s,]+/)

		for (const raw of items) {
			const trimmed = String(raw || '').trim().toLowerCase()
			if (!trimmed) continue
			result.add(trimmed.startsWith('#') ? trimmed : `#${trimmed}`)
		}

		return result
	}

	/**
	 * Validates extracted sections and returns a complete report of all unregistered tags.
	 * @param {import('./MarkdownAstExtractor.js').ExtractedSection[]} sections
	 * @param {string} [file]
	 * @returns {TagValidationResult}
	 */
	validate(sections, file = '') {
		/** @type {UnknownTagReportItem[]} */
		const unknownTags = []

		for (const section of sections || []) {
			for (const occ of section.tagOccurrences || []) {
				const normalized = occ.tag.toLowerCase()
				if (!this.registeredTags.has(normalized)) {
					unknownTags.push({
						tag: normalized,
						line: occ.line,
						section: occ.section,
						...(file ? { file } : {}),
					})
				}
			}
		}

		return TagLinter.formatReport(unknownTags)
	}

	/**
	 * Formats a structured error report from a list of unknown tag occurrences.
	 * @param {UnknownTagReportItem[]} unknownTags
	 * @returns {TagValidationResult}
	 */
	static formatReport(unknownTags) {
		if (!unknownTags.length) {
			return { valid: true, unknownTags: [], report: '' }
		}

		const lines = unknownTags.map((item) => {
			const filePrefix = item.file ? `${item.file}: ` : ''
			return `  - ${item.tag} (${filePrefix}Рядок ${item.line}, Секція "${item.section}")`
		})

		const report = [
			`🚨 ПОМИЛКА ВАЛІДАЦІЇ ТЕГІВ: Знайдено ${unknownTags.length} незареєстровані теги:`,
			...lines,
			'Експорт заблоковано для гарантії суверенності даних!',
			'Додайте їх у відповідні streams у вашому _.nan0 файлі.',
		].join('\n')

		return {
			valid: false,
			unknownTags,
			report,
		}
	}
}
