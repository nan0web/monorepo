import { Model } from '@nan0web/types'
import { LogicInspector } from '../../testing/LogicInspector.js'
import { VisualAdapter } from '../../testing/VisualAdapter.js'
import { result, show, render } from '../../core/Intent.js'
import SnapshotAuditor from './SnapshotAuditor.js'

/**
 * SnapshotRunner — Zero-Hallucination Snapshot Generation & Audit (Model-as-Schema v2).
 * Operates entirely through DB-FS abstraction without raw FS/Path hardcodes.
 */
export class SnapshotRunner extends Model {
	static UI = {
		generating: '📸 Generating snapshots for {lang}/{comp}',
		saved: '📸 Saved {file}',
		auditFailed: '🚨 Audit failed for {file}: {errors}',
		rootGallery:
			'# 📸 Core Snapshots Gallery\n\n**Total Snapshots:** {count} | **Total Errors:** {errors}\n\n## Locales\n\n',
		localeTitle: '🌍 Locale: {title}',
		categoryTitle: '📂 Category: {title}',
		backText: 'Back',
		backLink: '[⬅ {text}](../index.md)',
		galleryDescription: 'This gallery contains automatically generated interaction snapshots (Zero-Hallucination UI Core).',
	}

	static data = {
		type: 'string',
		help: 'Root directory containing locale folders with data.',
		default: 'docs',
	}

	static snapshotsDir = {
		type: 'string',
		help: 'Directory where output text snapshots will be stored.',
		default: 'snapshots/core',
	}

	/**
	 * @param {Partial<SnapshotRunner> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Directory containing snapshots */ this.snapshotsDir
		/** @type {string} Root data directory */ this.data
		/** @type {(compName: string) => string} */ this.getCategory = (comp) => 'Components'
		/** @type {(compName: string, varData: any) => AsyncGenerator<any>} */ this.createModelStream
	}

	get db() {
		return /** @type {import('@nan0web/db').DB} */ (this._.db)
	}

	/**
	 * Recursive drop for directories via DB-FS.
	 * @param {string} uri
	 */
	async dropRecursive(uri) {
		let entries = []
		try {
			for await (const entry of this.db.readDir(uri)) entries.push(entry)
		} catch (e) {
			return // Dir doesn't exist
		}
		for (const entry of entries) {
			if (entry.stat.isDirectory) {
				await this.dropRecursive(entry.path)
			} else {
				await this.db.dropDocument(entry.path)
			}
		}
		await this.db.dropDocument(uri)
	}

	async *run() {
		const db = this.db
		const t = this._.t || ((k) => k)

		// Clean before generation
		await this.dropRecursive(this.snapshotsDir)

		const doc = (await this.db.fetch('index')) ?? {}

		// Fetch languages
		const langsData = (await this.db.fetch(`${this.data}/_/langs`)) || []
		const langsIndex = {}
		if (Array.isArray(langsData)) {
			langsData.forEach((l) => {
				if (l && l.locale) langsIndex[l.locale] = l.title || l.locale
			})
		}

		const langs = []
		for await (const entry of this.db.readDir(this.data)) {
			if (entry.stat.isDirectory && entry.name !== '_' && entry.name !== 'site') langs.push(entry.name)
		}

		const galleryTree = {}
		let globalErrors = 0
		let globalCount = 0

		for (const lang of langs) {
			galleryTree[lang] = {}
			const componentsBase = `${this.data}/${lang}/components`
			const components = []
			try {
				for await (const entry of this.db.readDir(componentsBase)) {
					if (!entry.isDirectory) components.push(entry.name)
				}
			} catch (e) {}

			for (const file of components) {
				const compName = file.replace(/\.[^/.]+$/, "")
				const data = (await this.db.fetch(`${componentsBase}/${compName}`)) || {}

				// Extract variations
				const variations = data.content || []
				const variationsData = []

				for (let i = 0; i < variations.length; i++) {
					const rawVar = variations[i]
					let varData = rawVar[compName] !== undefined ? rawVar[compName] : rawVar

					// Extract schema defaults
					const schema = data['$' + compName] || {}
					const defaultProps = {}
					for (const [k, v] of Object.entries(schema)) {
						if (v && v.default !== undefined) {
							defaultProps[k] = v.default
						}
					}

					// Merge defaults
					if (typeof varData === 'object' && varData !== null) {
						varData = { ...defaultProps, ...varData }
					} else if (varData === true) {
						varData = { ...defaultProps }
					} else if (typeof varData === 'string' || typeof varData === 'number') {
						varData = { ...defaultProps, content: String(varData) }
					}

					let varName = rawVar.content || rawVar.title || rawVar.message || `var${i + 1}`
					if (typeof varName !== 'string') {
						if (typeof varData.title === 'string') varName = varData.title
						else if (typeof varData.content === 'string') varName = varData.content
						else varName = `var${i + 1}`
					}

					const safeVarName = varName
						.trim()
						.toLowerCase()
						.replace(/[./\\:]/g, '_')
						.replace(/\s+/g, '_')
						.replace(/_{2,}/g, '_')
						.slice(0, 50)

					// Build model stream
					let intents
					if (this.createModelStream) {
						intents = await LogicInspector.capture(this.createModelStream(compName, varData))
					} else {
						const defaultModelStream = async function* () {
							yield render(`ui-${compName.toLowerCase()}`, varData)
							return result({})
						}
						intents = await LogicInspector.capture(defaultModelStream())
					}

					const snapshot = intents.map((it) => VisualAdapter.render(it)).join('\n')

					const categoryPath = this.getCategory ? this.getCategory(compName) : 'Components'
					const outPath = `${this.snapshotsDir}/${lang}/${categoryPath}/${compName}`

					if (!galleryTree[lang][categoryPath]) galleryTree[lang][categoryPath] = {}
					if (!galleryTree[lang][categoryPath][compName])
						galleryTree[lang][categoryPath][compName] = { score: 100, errors: [] }

					const filePath = `${outPath}/${safeVarName}.nan0`
					await this.db.saveDocument(filePath, snapshot)

					yield show(t(SnapshotRunner.UI.generating, { lang, comp: `${compName}/${safeVarName}` }))
					variationsData.push({ safeVarName, snapshot })

					// Instant Audit
					const audit = SnapshotAuditor.inspectText(snapshot, lang, filePath, t)
					if (audit.score < 100) {
						galleryTree[lang][categoryPath][compName].score = Math.min(
							galleryTree[lang][categoryPath][compName].score,
							audit.score,
						)
						galleryTree[lang][categoryPath][compName].errors.push(...audit.errors)
						globalErrors += audit.errors.length
						yield show(
							t(SnapshotRunner.UI.auditFailed, {
								file: filePath,
								errors: audit.errors.join('; '),
							}),
							'error',
						)
					}
					globalCount++
				}

				// Generate index.md for component
				if (variationsData.length > 0) {
					const categoryPath = this.getCategory ? this.getCategory(compName) : 'Components'
					const outPath = `${this.snapshotsDir}/${lang}/${categoryPath}/${compName}`
					const desc = t(SnapshotRunner.UI.galleryDescription, undefined)

					const backPrefix = t(SnapshotRunner.UI.backLink, { text: t(SnapshotRunner.UI.backText, undefined) })
					let markdown = `${backPrefix}\n\n# ${compName}\n\n> ${desc}\n\n`
					for (const { safeVarName, snapshot } of variationsData) {
						markdown += `## ${safeVarName}\n\n\`\`\`yaml\n${snapshot}\n\`\`\`\n\n`
					}
					await this.db.saveDocument(`${outPath}/index.md`, markdown)
				}
			}
		}

		// Generate top-level indexes
		let rootMd = t(SnapshotRunner.UI.rootGallery, { count: globalCount, errors: globalErrors })

		for (const lang of Object.keys(galleryTree)) {
			const langTitle = langsIndex[lang] || lang
			rootMd += `- [${langTitle}](./${lang}/index.md) — ${t(SnapshotRunner.UI.galleryDescription, undefined)}\n`

			const backPrefix = t(SnapshotRunner.UI.backLink, { text: t(SnapshotRunner.UI.backText, undefined) })
			let langMd = `${backPrefix}\n\n# ${t(SnapshotRunner.UI.localeTitle, {
				title: langTitle,
			})}\n\n`

			for (const category of Object.keys(galleryTree[lang])) {
				langMd += `## [${category}](./${category}/index.md)\n\n`

				const backPrefix = t(SnapshotRunner.UI.backLink, { text: t(SnapshotRunner.UI.backText, undefined) })
				let catMd = `${backPrefix}\n\n# ${t(SnapshotRunner.UI.categoryTitle, {
					title: category,
				})}\n\n`

				for (const compName of Object.keys(galleryTree[lang][category])) {
					const compData = galleryTree[lang][category][compName]
					const status = compData.score === 100 ? '✅' : '❌'

					langMd += `- [${compName}](./${category}/${compName}/index.md) ${status}\n`
					catMd += `- [${compName}](./${compName}/index.md) ${status}\n`
					if (compData.errors.length) {
						catMd += `  - ${compData.errors.join('\\n  - ')}\n`
					}
				}
				langMd += '\n'

				const catDir = `${this.snapshotsDir}/${lang}/${category}`
				await this.db.saveDocument(`${catDir}/index.md`, catMd)
			}

			const langDir = `${this.snapshotsDir}/${lang}`
			await this.db.saveDocument(`${langDir}/index.md`, langMd)
		}

		await this.db.saveDocument(`${this.snapshotsDir}/index.md`, rootMd)
		return result({ success: globalErrors === 0, count: globalCount, errors: globalErrors })
	}
}

export default SnapshotRunner
