import { AuditorModel } from '@nan0web/inspect/domain/AuditorModel'
import { progress, result, show } from '@nan0web/ui'
import Markdown from '../Markdown.js'
import MDHeading from '../MDHeading.js'
import MDLink from '../MDLink.js'
import MDParagraph from '../MDParagraph.js'

/**
 * ProvenDocsAuditor — Verifies documentation structure, links, anchors, and consistency.
 */
export class ProvenDocsAuditor extends AuditorModel {
	static alias = 'provendocs'
	static depth = { type: 'number', default: 9, help: 'Search depth' }

	/** @type {Object<string, string>} UI messages for audit steps */
	static UI = {
		starting: 'Starting ProvenDocs Audit in {dir}...',
		warning_not_in_docs: 'Warning: {file} should be inside src/docs/',
		error_no_doc: 'Error: {file} corresponding {doc} not found',
		error_no_index: 'Error: Documentation index not found (docs/index.{md,nan0,yaml})',
		error_no_langs: 'Error: Language manifest not found (docs/_/langs.{nan0,yaml,md})',
		error_broken_link: 'Broken link in {file}: {link}',
		error_missing_anchor: 'Missing anchor #{anchor} in {target} (linked from {file})',
		error_no_db: 'Database not initialized',
	}

	/**
	 * @param {Partial<ProvenDocsAuditor>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {number} */
		this.depth = data.depth ?? 9
	}

	/**
	 * Standardizes text into a URL-friendly slug.
	 * @param {string} text - Input text.
	 * @returns {string} Normalized slug.
	 */
	static slugify(text) {
		return String(text)
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
	}

	/**
	 * Extracts all links and headers from document content.
	 * @param {string} content - Markdown content.
	 * @returns {{ links: { text: string, href: string }[], headers: Set<string> }}
	 */
	static parseDocInfo(content) {
		const elements = Markdown.parse(content)
		const links = []
		const headers = new Set()

		const walk = (els) => {
			for (const el of els) {
				if (el instanceof MDHeading) {
					headers.add(ProvenDocsAuditor.slugify(el.content))
				}
				if (el instanceof MDLink) {
					links.push({ text: el.content, href: el.href })
				}
				// Extract links from paragraphs/list items using fallback regex if not parsed as MDLink
				if (el instanceof MDParagraph || (el.content && !el.children?.length)) {
					const inlineLinks = String(el.content).matchAll(/\[(.*?)\]\((.*?)\)/g)
					for (const match of inlineLinks) {
						links.push({ text: match[1], href: match[2] })
					}
				}
				if (el.children?.length) walk(el.children)
			}
		}
		walk(elements)
		return { links, headers }
	}

	/**
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		/** @type {import('@nan0web/i18n').TFunction} */
		const t = this._.t
		const dir = this.dir
		const db = this._.db

		if (!db) {
			const msg = (t && t(ProvenDocsAuditor.UI.error_no_db)) || 'Database not initialized'
			return result({ success: false, errors: [{ message: msg }] })
		}

		yield progress((t && t(ProvenDocsAuditor.UI.starting, { dir })) || `Starting ProvenDocs Audit in ${dir}...`)

		const errors = []
		const warnings = []

		// 0. Mandatory documentation structure check
		const indexExists =
			(await this.fileExists('docs/index.md')) ||
			(await this.fileExists('docs/index.nan0')) ||
			(await this.fileExists('docs/index.yaml'))

		if (!indexExists) {
			const msg = (t && t(ProvenDocsAuditor.UI.error_no_index)) || 'Error: Documentation index not found (docs/index.{md,nan0,yaml})'
			errors.push({ message: msg })
			yield show(msg, 'error')
		}

		const readmeExists = await this.fileExists('docs/README.md')
		if (!readmeExists) {
			const msg = 'Error: Documentation README not found (docs/README.md)'
			errors.push({ message: msg })
			yield show(msg, 'error')
		}

		const langsFile = (await this.fileExists('docs/_/langs.nan0'))
			? 'docs/_/langs.nan0'
			: (await this.fileExists('docs/_/langs.yaml'))
				? 'docs/_/langs.yaml'
				: (await this.fileExists('docs/_/langs.md'))
					? 'docs/_/langs.md'
					: null

		if (!langsFile) {
			const msg = (t && t(ProvenDocsAuditor.UI.error_no_langs)) || 'Error: Language manifest not found (docs/_/langs.{nan0,yaml,md})'
			errors.push({ message: msg })
			yield show(msg, 'error')
		}

		// 1. Collect all MD files and build index
		const docIndex = new Map()
		const allMdFiles = []
		const mdJsFiles = []

		try {
			const stream = db.findStream(dir)
			for await (const { file } of stream) {
				if (file.name.endsWith('.md')) allMdFiles.push(file.path)
				if (file.path.includes('src/docs/') && file.name.endsWith('.md.js')) mdJsFiles.push(file.path)
			}
		} catch (e) {}

		yield progress(`Indexing ${allMdFiles.length} documents...`)

		for (const path of allMdFiles) {
			const content = await db.get(path)
			if (typeof content === 'string') {
				const info = ProvenDocsAuditor.parseDocInfo(content)
				docIndex.set(db.relative(path, dir), { ...info, path })
			}
		}

		// 2. Validate links and anchors
		for (const [relPath, info] of docIndex.entries()) {
			for (const link of info.links) {
				if (link.href.startsWith('http')) continue
				if (link.href.startsWith('mailto:')) continue

				const [targetPath, anchorRaw] = link.href.split('#')
				const anchor = anchorRaw ? ProvenDocsAuditor.slugify(anchorRaw) : null

				if (!targetPath || targetPath === '') {
					// Anchor in current file
					if (anchor && !info.headers.has(anchor)) {
						const msg = (t && t(ProvenDocsAuditor.UI.error_missing_anchor, { anchor: anchorRaw, target: relPath, file: relPath })) || `Missing anchor #${anchorRaw} in ${relPath}`
						errors.push({ file: relPath, error: msg })
						yield show(msg, 'error')
					}
					continue
				}

				// Resolve relative path
				const resolvedRelPath = db.resolveSync(db.dirname(relPath), targetPath)
				const targetInfo = docIndex.get(resolvedRelPath)

				if (!targetInfo) {
					const msg = (t && t(ProvenDocsAuditor.UI.error_broken_link, { file: relPath, link: link.href })) || `Broken link in ${relPath}: ${link.href}`
					errors.push({ file: relPath, link: link.href, error: msg })
					yield show(msg, 'error')
				} else if (anchor && !targetInfo.headers.has(anchor)) {
					const msg = (t && t(ProvenDocsAuditor.UI.error_missing_anchor, { anchor: anchorRaw, target: resolvedRelPath, file: relPath })) || `Missing anchor #${anchorRaw} in ${resolvedRelPath}`
					errors.push({ file: relPath, error: msg })
					yield show(msg, 'error')
				}
			}
		}

		// 3. md.js consistency and hygiene checks
		for (const filePath of mdJsFiles) {
			const relPath = db.relative(filePath, dir)
			let docPath = relPath.replace('src/docs/', 'docs/').replace('.md.js', '.md')
			
			if (!(await this.fileExists(docPath))) {
				const altPaths = ['en', 'uk'].map(l => docPath.replace('docs/', `docs/${l}/`))
				for (const alt of altPaths) {
					if (await this.fileExists(alt)) {
						docPath = alt
						break
					}
				}
			}

			if (!(await this.fileExists(docPath))) {
				const msg = (t && t(ProvenDocsAuditor.UI.error_no_doc, { file: relPath, doc: docPath })) || `Error: ${relPath} corresponding ${docPath} not found`
				errors.push({ file: relPath, message: msg })
				yield show(msg, 'error')
				continue
			}

			const content = await db.get(docPath)
			if (typeof content === 'string') {
				const codeBlocks = content.match(/```/g) || []
				if (codeBlocks.length % 2 !== 0) {
					const msg = `Error: Unbalanced code blocks in ${docPath}`
					errors.push({ file: docPath, message: msg })
					yield show(msg, 'error')
				}
				if (content.includes('[artifact:') || content.includes('<!-- %')) {
					const msg = `Warning: Placeholder artifacts found in ${docPath}`
					warnings.push({ file: docPath, message: msg })
					yield show(msg, 'warn')
				}
			}
		}

		const success = errors.length === 0
		return result({ success, errors, warnings })
	}
}

