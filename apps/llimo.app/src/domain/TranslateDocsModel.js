import { Model } from '@nan0web/types'
import { AI, ModelInfo } from '@nan0web/ai'
import { load } from '@nan0web/db-fs'
import FSDriver from '@nan0web/db-fs/src/FSDriver.js'
import { glob } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { Table } from '@nan0web/ui-cli'

/**
 * @property {string} source Glob pattern for source files
 * @property {string} target Target directory for translated files
 * @property {string} from Source language code
 * @property {string} to Target language code
 * @property {boolean} quiet Quiet mode (suppress logs and progress)
 */
export class TranslateDocsModel extends Model {
	/**
	 * @param {Partial<TranslateDocsModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {any} Glob pattern for source files */ this.source
		/** @type {any} Target directory for translated files */ this.target
		/** @type {any} Source language code */ this.from
		/** @type {any} Target language code */ this.to
		/** @type {boolean} Quiet mode (suppress logs and progress) */ this.quiet
	}






	static source = {
		help: 'Glob pattern for source files',
		default: 'docs/uk/**/*.md',
		positional: true,
	}

	static target = {
		help: 'Target directory for translated files',
		default: 'docs/en',
		positional: true,
	}

	static from = {
		help: 'Source language code',
		default: 'uk',
	}

	static to = {
		help: 'Target language code',
		default: 'en_GB',
	}

	static quiet = {
		help: 'Quiet mode (suppress logs and progress)',
		default: false,
		alias: 'q',
		type: 'boolean',
	}

	async *run() {
		const startTime = performance.now()
		const absoluteTarget = resolve(process.cwd(), this.target)

		// Collect files matching the glob
		const files = []
		for await (const entry of glob(this.source)) {
			files.push(entry)
		}

		if (files.length === 0) {
			yield {
				type: 'log',
				level: 'warning',
				message: `No files found matching "${this.source}"`,
			}
			return { status: 'failed', reason: 'no_files' }
		}

		if (!this.quiet) {
			yield {
				type: 'log',
				level: 'info',
				message: `Found ${files.length} markdown file(s) to translate.`,
			}
		}

		// Initialize FSDriver for safe writes (auto mkdir)
		const fs = FSDriver.from({ root: absoluteTarget, cwd: process.cwd() })
		await fs.connect()

		// Initialize AI
		const ai = /** @type {any} */ (this._)?.ai || new AI({ strategy: new AI.Strategy({ finance: 'free', speed: 'fast', level: 'smart' }) })
		if (!this.quiet) yield { type: 'progress', message: 'Initializing AI models...' }
		await ai.refreshModels()

		if (!this.quiet) {
			yield {
				type: 'log',
				level: 'success',
				message: `AI Models loaded (${ai.getModels().length} total)`,
			}
		}

		// Stats accumulation
		let totalInputTokens = 0
		let totalOutputTokens = 0
		let totalBudget = 0
		let translatedCount = 0

		// Derive baseDir from the glob pattern
		let baseDir = this.source
		const starIdx = this.source.indexOf('*')
		if (starIdx !== -1) {
			baseDir = this.source.substring(0, starIdx)
		} else {
			baseDir = dirname(this.source) + '/'
		}
		baseDir = resolve(process.cwd(), baseDir)

		for (const file of files) {
			const fileStartTime = performance.now()
			const sourcePath = resolve(process.cwd(), file)
			let relativePath = relative(baseDir, sourcePath)
			if (relativePath.startsWith('..') || relativePath === '') {
				relativePath = basename(sourcePath)
			}
			const targetPath = join(absoluteTarget, relativePath)

			// Load .md with frontmatter support
			const doc = load(sourcePath)
			const content = typeof doc === 'string' ? doc : (doc?.content ?? '')

			// Preserve frontmatter metadata
			const metadata = typeof doc === 'object' ? { ...doc } : {}
			delete metadata.content

			const prompt = `You are a professional technical translator. Translate the following Markdown text from ${this.from} to ${this.to}.\nRules:\n- Maintain ALL markdown formatting, headings, lists, links, and code blocks exactly as they are.\n- Translate ONLY the natural language content — NOT code, variable names, file paths, or URLs.\n- Do NOT add any extra commentary. Return ONLY the translated Markdown.\n- Target language variant: ${this.to}.`

			const messages = [
				{ role: 'system', content: prompt },
				{ role: 'user', content },
			]

			try {
				if (!this.quiet) yield { type: 'progress', message: `→ ${relativePath}` }

				// Find the best model with sufficient context
				const estimatedTokens = Math.ceil(content.length / 3)
				let bestModel = ai.strategy.findModel(
					ai.getModelsMap(),
					estimatedTokens,
					estimatedTokens + 10000,
				)

				if (!bestModel) {
					const candidates = ai.getModels()
					bestModel = candidates.length ? candidates[0] : null
				}
				if (!bestModel) {
					bestModel = new ModelInfo({ id: 'openrouter/auto', provider: 'openrouter' })
				}

				const { text, usage, usedModel, usedProvider } = await ai.generateText(bestModel, messages)

				const fileEndTime = performance.now()
				const fileDuration = (fileEndTime - fileStartTime) / 1000

				// Stats
				const input = usage?.inputTokens || 0
				const output = usage?.outputTokens || 0
				const cost = bestModel.pricing ? bestModel.pricing.calc(usage) : 0

				totalInputTokens += input
				totalOutputTokens += output
				totalBudget += cost
				translatedCount++

				if (!this.quiet) {
					yield {
						type: 'log',
						level: 'success',
						message: `✔ Done in ${fileDuration.toFixed(2)}s | ${usedModel}@${usedProvider} | Cost: $${cost.toFixed(6)}`,
					}
				}

				// Save with frontmatter
				const hasMetadata = Object.keys(metadata).length > 0
				await fs.write(targetPath, hasMetadata ? { ...metadata, content: text } : text)
			} catch (/** @type {any} */ err) {
				yield { type: 'log', level: 'error', message: `✘ Error: ${err.message}` }
			}
		}

		const totalDuration = (performance.now() - startTime) / 1000

		if (!this.quiet) {
			yield {
				type: 'log',
				level: 'success',
				message: `\n✔ Finished translating ${translatedCount} file(s) in ${totalDuration.toFixed(2)}s`,
			}
		}

		// Premium Summary Table using OLMUI component
		const summaryView = Table({
			interactive: false,
			title: '\x1b[1mTRANSLATION SUMMARY\x1b[0m',
			data: [
				{ Metric: 'Files', Value: translatedCount },
				{ Metric: 'Duration', Value: `${totalDuration.toFixed(2)}s` },
				{ Metric: 'Tokens (In/Out)', Value: `${totalInputTokens} / ${totalOutputTokens}` },
				{ Metric: 'Total Tokens', Value: totalInputTokens + totalOutputTokens },
				{ Metric: 'Budget Spent', Value: `$${totalBudget.toFixed(6)}` },
			],
		})

		yield { type: 'log', level: 'info', message: '\n' + String(summaryView) }

		yield { type: 'result', data: { translatedCount, totalDuration, totalBudget } }

		return { status: 'ok', data: { translatedCount, totalBudget } }
	}
}
