import Markdown, { MDCodeBlock, MDHeading1, MDHeading2 } from '@nan0web/markdown'

/**
 * @typedef {object} TagOccurrence
 * @property {string} tag
 * @property {number} line
 * @property {string} section
 */

/**
 * @typedef {object} ExtractedSection
 * @property {string} title
 * @property {string} heading
 * @property {number} level
 * @property {string} content
 * @property {import('@nan0web/markdown').MDElement[]} elements
 * @property {string[]} tags
 * @property {TagOccurrence[]} tagOccurrences
 */

/**
 * @typedef {object} ExtractedDocument
 * @property {string} title
 * @property {ExtractedSection[]} sections
 */

const TAG_REGEX = /(^|[\s(])(#[\p{L}\p{N}_ʼ']+)/gu

/**
 * Strips inline code (`...`) and KaTeX ($...$ / $$...$$) from a line before extracting hashtags.
 * @param {string} line
 * @returns {string}
 */
function stripInlineProtected(line) {
	return line
		.replace(/\$\$[\s\S]*?\$\$/g, ' ')
		.replace(/\$[^$\n]+\$/g, ' ')
		.replace(/`[^`\n]+`/g, ' ')
}

/**
 * MarkdownAstExtractor — parses Markdown into structured H2 sections using @nan0web/markdown AST.
 */
export class MarkdownAstExtractor {
	/**
	 * Extracts title, H2 sections, tags, and exact 1-based line occurrences from raw Markdown.
	 * @param {string} raw
	 * @returns {ExtractedDocument}
	 */
	extract(raw) {
		const source = String(raw || '')
		const md = new Markdown(source)
		const elements = md.document?.children || []

		let title = ''
		/** @type {ExtractedSection[]} */
		const sections = []
		/** @type {ExtractedSection | null} */
		let current = null

		for (const el of elements) {
			if (el instanceof MDHeading1 && !title) {
				title = String(el.content || '').trim()
				continue
			}

			if (el instanceof MDHeading2) {
				const secTitle = String(el.content || '').trim()
				current = {
					title: secTitle,
					heading: `## ${secTitle}`,
					level: 2,
					elements: [],
					content: '',
					tags: [],
					tagOccurrences: [],
				}
				sections.push(current)
				continue
			}

			if (!current) {
				if (!el.toString().trim()) continue
				current = {
					title: title || 'Preamble',
					heading: title ? `# ${title}` : 'Preamble',
					level: 1,
					elements: [],
					content: '',
					tags: [],
					tagOccurrences: [],
				}
				sections.push(current)
			}

			current.elements.push(el)
		}

		for (const section of sections) {
			section.content = section.elements
				.map((el) => {
					if (el instanceof MDCodeBlock) {
						return el.toString().trimEnd()
					}
					return el.toString().trim()
				})
				.filter(Boolean)
				.join('\n\n')
		}

		// Map exact line numbers and sections for all hashtags outside code blocks/inline code/KaTeX
		const lines = source.split('\n')
		let inFence = false
		let activeSectionHeading = title ? `# ${title}` : 'Preamble'
		/** @type {Map<string, ExtractedSection>} */
		const sectionByHeading = new Map(sections.map((s) => [s.heading, s]))

		for (let i = 0; i < lines.length; i++) {
			const lineStr = lines[i]
			const trimmed = lineStr.trim()

			if (trimmed.startsWith('```')) {
				inFence = !inFence
				continue
			}
			if (inFence) continue

			if (trimmed.startsWith('## ')) {
				activeSectionHeading = `## ${trimmed.slice(3).trim()}`
				continue
			}
			if (trimmed.startsWith('# ') && !title) {
				activeSectionHeading = `# ${trimmed.slice(2).trim()}`
				continue
			}

			const cleanLine = stripInlineProtected(lineStr)
			TAG_REGEX.lastIndex = 0
			let match
			while ((match = TAG_REGEX.exec(cleanLine)) !== null) {
				const tag = match[2].toLowerCase()
				const targetSection = sectionByHeading.get(activeSectionHeading) || sections[0]
				if (targetSection) {
					if (!targetSection.tags.includes(tag)) {
						targetSection.tags.push(tag)
					}
					targetSection.tagOccurrences.push({
						tag,
						line: i + 1,
						section: targetSection.heading,
					})
				}
			}
		}

		return { title, sections }
	}
}
