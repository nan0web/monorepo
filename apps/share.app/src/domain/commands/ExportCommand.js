import { ModelAsApp } from '@nan0web/ui-cli'
import { progress, show, result, log } from '@nan0web/ui'
import { MarkdownAstExtractor } from '../services/MarkdownAstExtractor.js'
import { TagLinter } from '../services/TagLinter.js'
import { SemanticStreamRouter } from '../services/SemanticStreamRouter.js'

/**
 * @typedef {object} ExportCommandOptions
 * @property {string} [config=''] - Hierarchical config URI for db.fetch()
 * @property {string} [path=''] - Path to Markdown file to export
 * @property {string} [target=''] - Batch target mode (e.g. 'all')
 * @property {boolean} [dryRun=false] - Simulate export without writing files
 * @property {string} [output=''] - Optional output base directory override
 */

/**
 * ExportCommand — Universal Semantic Exporter Pipeline (v3.8.0).
 * Routes Markdown files into configured streams via @nan0web/markdown AST and TagLinter.
 */
export class ExportCommand extends ModelAsApp {
	static alias = 'export'

	static UI = {
		title: '📤 Export: Universal Semantic Stream Exporter',
		missingConfig: '❌ Configuration URI is required. Usage: visnyk export --config=arch/diary --path=story.md',
		configNotFound: '❌ Configuration not found: {config}',
		missingInput: '❌ Provide --path=<file.md> or --target=all',
		noFilesFound: '⚠️ No Markdown files found to export in {baseDir}',
		validating: '🔍 Validating {count} Markdown file(s) against stream tags...',
		exporting: '📤 Exporting {file} across semantic streams...',
		exportedItem: '💾 [{stream}/{locale}] -> {destPath}',
		isolatedItem: '🔒 [{stream}] Isolated locally ({count} section(s))',
		done: '🎉 Export completed! Files: {files}, Written: {written}, Isolated: {isolated}',
	}

	static config = {
		default: 'export',
		help: 'Config document URI (inherits _/ directory globals via db.fetch)',
	}

	static path = {
		default: '',
		positional: true,
		help: 'Path to Markdown file to export',
	}

	static target = {
		default: '',
		help: 'Batch target mode (e.g. all)',
	}

	static dryRun = {
		default: false,
		help: 'Dry run without writing exported files',
	}

	static output = {
		default: '',
		help: 'Optional base output directory override',
	}

	/**
	 * @param {Partial<ExportCommandOptions>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions> & { translator?: import('../services/SemanticStreamRouter.js').TranslatorPort }} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)

		/** @type {string} Hierarchical config URI */
		this.config
		/** @type {string} Path to Markdown file to export */
		this.path
		/** @type {string} Batch target mode */
		this.target
		/** @type {boolean} Dry run mode */
		this.dryRun
		/** @type {string} Optional output base directory */
		this.output
		/** @type {import('../services/SemanticStreamRouter.js').TranslatorPort | null} Injected translator */
		this.$translator = options?.translator || null
	}

	/**
	 * Resolves target Markdown file paths using db.browse().
	 * @param {import('@nan0web/db').default} db
	 * @param {string} baseDir
	 * @returns {Promise<string[]>}
	 */
	async resolveTargetFiles(db, baseDir) {
		if (this.path) {
			return [db.normalize(this.path)]
		}

		if (this.target === 'all') {
			/** @type {string[]} */
			const files = []
			for await (const entry of db.browse(baseDir || '.', { depth: 10 })) {
				if (entry.isFile && entry.name.toLowerCase().endsWith('.md')) {
					files.push(entry.uri || entry.path)
				}
			}
			return files.sort()
		}

		return []
	}

	/**
	 * Computes destination document path inside $db using db path utilities.
	 * @param {import('@nan0web/db').default} db
	 * @param {string} sourceFile
	 * @param {string} baseDir
	 * @param {import('../services/SemanticStreamRouter.js').RoutedExportItem} item
	 * @returns {string}
	 */
	resolveExportPath(db, sourceFile, baseDir, item) {
		const rel = baseDir && baseDir !== '.' ? db.relative(baseDir, sourceFile) : db.normalize(sourceFile)
		const destBase = this.output || item.destination?.path || db.normalize(`export/${item.streamId}`)
		return item.locale && item.locale !== 'source'
			? db.normalize(`${destBase}/${item.locale}/${rel}`)
			: db.normalize(`${destBase}/${rel}`)
	}

	/**
	 * Executes the export pipeline.
	 * @returns {AsyncGenerator<import('@nan0web/ui/core').Intent, any, any>}
	 */
	async *run() {
		const { t } = this._
		const db = this.$db

		if (!this.config) {
			yield show(t(ExportCommand.UI.missingConfig), 'error')
			return result({ status: 'error', reason: 'missing_config' })
		}

		const configData = await db.fetch(this.config).catch(() => null)
		if (!configData || typeof configData !== 'object') {
			yield show(t(ExportCommand.UI.configNotFound, { config: this.config }), 'error')
			return result({
				status: 'error',
				reason: 'config_not_found',
				message: t(ExportCommand.UI.configNotFound, { config: this.config }),
			})
		}

		const baseDir = db.dirname(this.config) === '.' ? '' : db.dirname(this.config).replace(/\/+$/, '')

		if (!this.path && this.target !== 'all') {
			yield show(t(ExportCommand.UI.missingInput), 'error')
			return result({ status: 'error', reason: 'missing_input' })
		}

		const files = await this.resolveTargetFiles(db, baseDir)
		if (files.length === 0) {
			yield show(t(ExportCommand.UI.noFilesFound, { baseDir: baseDir || '.' }), 'warn')
			return result({ status: 'ok', files: 0, written: 0, isolated: 0 })
		}

		const extractor = new MarkdownAstExtractor()
		const linter = new TagLinter({ streams: configData.streams || [] })
		const router = new SemanticStreamRouter({ config: configData, translator: this.$translator })

		yield progress(t(ExportCommand.UI.validating, { count: files.length }), 0)

		// Phase 1: Parse and lint ALL files before exporting anything
		/** @type {Array<{ file: string, extracted: import('../services/MarkdownAstExtractor.js').ExtractedDocument }>} */
		const parsedDocs = []
		/** @type {import('../services/TagLinter.js').UnknownTagReportItem[]} */
		const allUnknownTags = []

		for (const file of files) {
			const raw = await db.loadDocument(file, null).catch(() => null)
			if (typeof raw !== 'string') continue
			const extracted = extractor.extract(raw)
			const validation = linter.validate(extracted.sections, files.length > 1 ? file : '')
			if (!validation.valid) {
				allUnknownTags.push(...validation.unknownTags)
			}
			parsedDocs.push({ file, extracted })
		}

		if (allUnknownTags.length > 0) {
			const fullReport = TagLinter.formatReport(allUnknownTags)
			yield show(fullReport.report, 'error')
			return result({
				status: 'error',
				reason: 'unknown_tags',
				unknownTags: fullReport.unknownTags,
				message: fullReport.report,
			})
		}

		// Phase 2: Route and export
		let writtenCount = 0
		let isolatedCount = 0
		/** @type {Array<{ file: string, streamId: string, locale: string, path: string }>} */
		const exportedArtifacts = []

		for (let i = 0; i < parsedDocs.length; i++) {
			const { file, extracted } = parsedDocs[i]
			yield progress(t(ExportCommand.UI.exporting, { file }), (i + 1) / parsedDocs.length)

			const routed = await router.route(extracted)
			for (const iso of routed.isolated) {
				isolatedCount += iso.sections.length
				yield log(
					t(ExportCommand.UI.isolatedItem, {
						stream: iso.streamId,
						count: iso.sections.length,
					}),
					'info',
				)
			}

			for (const item of routed.exports) {
				const destPath = this.resolveExportPath(db, file, baseDir, item)
				if (!this.dryRun) {
					await db.saveDocument(destPath, item.content)
				}
				writtenCount++
				exportedArtifacts.push({
					file,
					streamId: item.streamId,
					locale: item.locale,
					path: destPath,
				})
				yield log(
					t(ExportCommand.UI.exportedItem, {
						stream: item.streamId,
						locale: item.locale,
						destPath,
					}),
					'success',
				)
			}
		}

		const summary = t(ExportCommand.UI.done, {
			files: parsedDocs.length,
			written: writtenCount,
			isolated: isolatedCount,
		})

		yield show(summary, 'success')
		return result({
			status: 'ok',
			files: parsedDocs.length,
			written: writtenCount,
			isolated: isolatedCount,
			exports: exportedArtifacts,
			message: summary,
		})
	}
}
