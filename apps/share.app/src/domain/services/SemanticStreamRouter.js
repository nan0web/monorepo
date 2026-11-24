import { TagLinter } from './TagLinter.js'

/**
 * @typedef {object} TranslatorPort
 * @property {(text: string, targetLocale: string, glossary?: Record<string, string>) => Promise<string>} translate
 */

/**
 * @typedef {object} RoutedIsolatedStream
 * @property {string} streamId
 * @property {string} [name]
 * @property {import('./MarkdownAstExtractor.js').ExtractedSection[]} sections
 */

/**
 * @typedef {object} RoutedExportItem
 * @property {string} streamId
 * @property {string} locale
 * @property {string} format
 * @property {string} content
 * @property {Record<string, any>} destination
 * @property {import('./MarkdownAstExtractor.js').ExtractedSection[]} sections
 */

/**
 * @typedef {object} RouteResult
 * @property {RoutedIsolatedStream[]} isolated
 * @property {RoutedExportItem[]} exports
 */

/**
 * SemanticStreamRouter — routes Markdown AST sections to configured streams,
 * enforces isolation, strips tags when requested, protects code/KaTeX, and invokes translation.
 */
export class SemanticStreamRouter {
	/** @type {{ streams: import('./TagLinter.js').StreamConfig[], glossary: Record<string, string> }} */
	config
	/** @type {TranslatorPort | null} */
	translator

	/**
	 * @param {object} [options]
	 * @param {{ streams?: import('./TagLinter.js').StreamConfig[], glossary?: Record<string, string> }} [options.config]
	 * @param {TranslatorPort | null} [options.translator]
	 */
	constructor({ config = {}, translator = null } = {}) {
		this.config = {
			streams: config.streams || [],
			glossary: config.glossary || {},
		}
		this.translator = translator
	}

	/**
	 * Protects fenced code blocks, inline code, and KaTeX formulas ($...$, $$...$$)
	 * and applies 1:1 glossary term replacements to the remaining prose.
	 * @param {string} input
	 * @returns {{ text: string, restore: (translated: string) => string }}
	 */
	protectAndApplyGlossary(input) {
		/** @type {string[]} */
		const saved = []
		const protect = (match) => {
			const token = `__NAN0_PROTECTED_${saved.length}__`
			saved.push(match)
			return token
		}

		let text = String(input || '')
			.replace(/```[\s\S]*?```/g, protect)
			.replace(/\$\$[\s\S]*?\$\$/g, protect)
			.replace(/\$[^$\n]+\$/g, protect)
			.replace(/`[^`\n]+`/g, protect)

		for (const [term, replacement] of Object.entries(this.config.glossary || {})) {
			if (!term || !replacement) continue
			const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
			const regex = new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, 'gu')
			text = text.replace(regex, replacement)
		}

		const restore = (translated) => {
			let out = String(translated || '')
			for (let i = 0; i < saved.length; i++) {
				out = out.replace(`__NAN0_PROTECTED_${i}__`, saved[i])
			}
			return out
		}

		return { text, restore }
	}

	/**
	 * Strips hashtags from text while keeping code blocks and KaTeX formulas intact.
	 * @param {string} input
	 * @returns {string}
	 */
	stripHashtags(input) {
		/** @type {string[]} */
		const saved = []
		const protect = (match) => {
			const token = `__NAN0_STRIP_PROTECTED_${saved.length}__`
			saved.push(match)
			return token
		}

		let text = String(input || '')
			.replace(/```[\s\S]*?```/g, protect)
			.replace(/\$\$[\s\S]*?\$\$/g, protect)
			.replace(/\$[^$\n]+\$/g, protect)
			.replace(/`[^`\n]+`/g, protect)

		text = text
			.replace(/(^|[\s(])#[\p{L}\p{N}_ʼ']+/gu, '$1')
			.replace(/[ \t]{2,}/g, ' ')
			.replace(/[ \t]+$/gm, '')

		for (let i = 0; i < saved.length; i++) {
			text = text.replace(`__NAN0_STRIP_PROTECTED_${i}__`, saved[i])
		}

		return text.trim()
	}

	/**
	 * Renders a document from title and selected sections.
	 * @param {string} title
	 * @param {import('./MarkdownAstExtractor.js').ExtractedSection[]} sections
	 * @returns {string}
	 */
	static renderMarkdown(title, sections) {
		const parts = []
		if (title) parts.push(`# ${title}`)
		for (const sec of sections) {
			if (sec.level === 2) {
				parts.push(`${sec.heading}\n\n${sec.content}`.trim())
			} else if (sec.content) {
				parts.push(sec.content)
			}
		}
		return parts.join('\n\n').trim() + '\n'
	}

	/**
	 * Routes an extracted document across all configured streams.
	 * @param {import('./MarkdownAstExtractor.js').ExtractedDocument} extractedDoc
	 * @returns {Promise<RouteResult>}
	 */
	async route(extractedDoc) {
		/** @type {RoutedIsolatedStream[]} */
		const isolated = []
		/** @type {RoutedExportItem[]} */
		const exports = []

		for (const stream of this.config.streams) {
			const streamTags = TagLinter.normalizeTags(stream.tags)
			const matchedSections = extractedDoc.sections.filter((sec) =>
				sec.tags.some((t) => streamTags.has(t.toLowerCase())),
			)

			if (matchedSections.length === 0) continue

			if (stream.action === 'isolate') {
				isolated.push({
					streamId: stream.id,
					name: stream.name,
					sections: matchedSections,
				})
				continue
			}

			const destinations = Array.isArray(stream.destinations) && stream.destinations.length > 0
				? stream.destinations
				: [{ format: 'markdown' }]

			for (const dest of destinations) {
				let content = SemanticStreamRouter.renderMarkdown(extractedDoc.title, matchedSections)
				if (dest.stripTags) {
					content = this.stripHashtags(content) + '\n'
				}

				exports.push({
					streamId: stream.id,
					locale: 'source',
					format: dest.format || 'markdown',
					content,
					destination: dest,
					sections: matchedSections,
				})

				if (Array.isArray(stream.translate)) {
					for (const targetLocale of stream.translate) {
						const prepared = this.protectAndApplyGlossary(content)
						let translatedBody = prepared.text
						if (this.translator && typeof this.translator.translate === 'function') {
							translatedBody = await this.translator.translate(
								prepared.text,
								targetLocale,
								this.config.glossary,
							)
						}
						const restored = prepared.restore(translatedBody)
						exports.push({
							streamId: stream.id,
							locale: targetLocale,
							format: dest.format || 'markdown',
							content: restored,
							destination: dest,
							sections: matchedSections,
						})
					}
				}
			}
		}

		return { isolated, exports }
	}
}
