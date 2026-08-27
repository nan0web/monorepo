import { ModelAsApp } from '@nan0web/ui-cli'
import { Markdown } from '@nan0web/markdown'
import { spawn } from 'node:child_process'
import path from 'node:path'

/**
 * PipelineApp — OLMUI Pipeline runner for executing sequence of steps defined in pipeline.md.
 */
export class PipelineApp extends ModelAsApp {
	static alias = 'pipeline'
	static UI = {
		title: 'Pipeline Runner',
		icon: '⚙️',
	}

	static file = {
		help: 'Path to pipeline.md file',
		type: 'string',
		default: 'pipeline.md',
		positional: true,
	}

	static output = {
		help: 'Output mode (rich, result, quiet, json)',
		type: 'string',
		alias: 'o',
		default: 'rich',
	}

	/**
	 * @param {Partial<PipelineApp> | Record<string, any>} [data] Initial state
	 * @param {any} [options] Model options
	 */
	constructor(data = {}, options = {}) {
		super(data, /** @type {any} */ (options))
		/** @type {string} */ this.file = data.file || 'pipeline.md'
		/** @type {string} */ this.output = data.output || 'rich'
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { show, result, ask } = await import('@nan0web/ui')

		if (this.help) {
			const content = this.generateHelp()
			const title = /** @type {any} */ (this.constructor).UI?.title || 'Help'
			yield ask('help', { content, title: `${title} Help`, hint: 'content-viewer' })
			return
		}

		const {
			workspaceDb,
			workspaceRoot = process.cwd(),
			executor,
			t = (k) => k,
		} = /** @type {any} */ (this._)

		let content = ''
		const fs = await import('node:fs/promises')
		const invokingCwd = process.env.INIT_CWD || process.cwd()
		const fromCwd = path.isAbsolute(this.file) ? this.file : path.resolve(invokingCwd, this.file)
		const fromWorkspace = path.isAbsolute(this.file)
			? this.file
			: path.resolve(workspaceRoot, this.file)

		content = await fs.readFile(fromCwd, 'utf8').catch(async () => {
			return await fs.readFile(fromWorkspace, 'utf8').catch(async () => {
				if (workspaceDb) {
					return (await workspaceDb.fetch(this.file).catch(() => '')) || ''
				}
				return ''
			})
		})

		if (!content) {
			yield show(t('Pipeline file {file} not found or empty.', { file: this.file }), 'error')
			return
		}

		const steps = this.parsePipeline(content)
		if (steps.length === 0) {
			yield show(t('No executable steps found in {file}.', { file: this.file }), 'error')
			return
		}

		const isQuiet = this.output === 'quiet'
		const isResultOnly = this.output === 'result'

		if (!isQuiet && !isResultOnly) {
			yield show(t('🚀 Starting pipeline: {total} steps', { total: steps.length }), 'info')
		}

		let totalTokens = 0
		let promptTokens = 0
		let completionTokens = 0
		let totalMoney = 0
		let totalTime = 0
		let valuta = 'USD'
		const results = []
		let modifiedFiles = []

		let resolvedPipelinePath = fromCwd
		try {
			await fs.access(fromCwd)
		} catch {
			resolvedPipelinePath = fromWorkspace
		}
		const pipelineDir = path.dirname(resolvedPipelinePath)

		for (let i = 0; i < steps.length; i++) {
			const step = steps[i]
			const stepNum = i + 1

			if (!isQuiet && !isResultOnly) {
				yield show(
					t('[{current}/{total}] Running: {name}...', {
						current: stepNum,
						total: steps.length,
						name: step.name,
					}),
					'info'
				)
			}

			let stepResult
			if (executor) {
				stepResult = await executor(step.command, step, { modifiedFiles, pipelineDir })
			} else {
				stepResult = await this._executeCommand(step.command, pipelineDir || invokingCwd)
			}

			results.push({
				step: step.name,
				status: stepResult.status,
				duration_ms: stepResult.duration_ms,
				...(stepResult.error ? { error: stepResult.error } : {}),
			})

			if (stepResult.usage) {
				totalTokens += stepResult.usage.totalTokens || 0
				promptTokens += stepResult.usage.promptTokens || 0
				completionTokens += stepResult.usage.completionTokens || 0
			}

			if (stepResult.cost) {
				totalMoney += stepResult.cost.money || 0
				totalTime += stepResult.cost.time || 0
				if (stepResult.cost.valuta) valuta = stepResult.cost.valuta
			}

			if (Array.isArray(stepResult.files)) {
				modifiedFiles = Array.from(new Set([...modifiedFiles, ...stepResult.files]))
			}

			if (stepResult.status === 'failed') {
				yield show(
					t('❌ Step failed: {name}\n{error}', {
						name: step.name,
						error: stepResult.error || 'Execution failed',
					}),
					'error'
				)
				yield result({
					pipeline: this.file,
					status: 'failed',
					failedStep: step.name,
					error: stepResult.error || 'Execution failed',
					steps: results,
				})
				return
			}

			if (!isQuiet && !isResultOnly) {
				yield show(t('✔ Step completed: {name}', { name: step.name }), 'success')
			}
		}

		const summary = {
			pipeline: this.file,
			status: 'passed',
			totalCost: { money: Number(totalMoney.toFixed(4)), time: totalTime, valuta },
			totalUsage: { promptTokens, completionTokens, totalTokens },
			steps: results,
			files: modifiedFiles,
		}

		yield result(summary)
	}

	/**
	 * Parse markdown content into executable steps.
	 * @param {string} mdContent
	 * @returns {Array<{ id: string, name: string, command: string }>}
	 */
	parsePipeline(mdContent) {
		const elements = Markdown.parse(mdContent)
		const steps = []

		let currentStep = null

		for (const el of elements) {
			const type = el.constructor.name
			const headingLevel = Number(el.heading || 0)

			if (type === 'MDHeading2' || headingLevel === 2) {
				if (currentStep && currentStep.command) {
					steps.push(currentStep)
				}
				const title = String(el.content || el.text || 'Step').trim()
				currentStep = {
					id: title.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
					name: title,
					command: '',
				}
			} else if (type === 'MDCodeBlock' || type === 'CodeBlock') {
				if (
					currentStep &&
					(el.language === 'bash' || el.lang === 'bash' || el.language === 'sh' || !el.language)
				) {
					const code = (el.content || el.text || '').trim()
					if (code) {
						currentStep.command = currentStep.command ? `${currentStep.command}\n${code}` : code
					}
				}
			}
		}

		if (currentStep && currentStep.command) {
			steps.push(currentStep)
		}

		return steps
	}

	/**
	 * @param {string} command
	 * @param {string} root
	 * @returns {Promise<{ status: string, output?: string, error?: string }>}
	 */
	async _executeCommand(command, root) {
		return new Promise((resolve) => {
			const start = Date.now()
			const proc = spawn(command, { cwd: root, shell: true, stdio: ['inherit', 'pipe', 'pipe'] })
			let stdout = ''
			let stderr = ''

			proc.stdout?.on('data', (d) => {
				stdout += d
				process.stdout.write(d)
			})
			proc.stderr?.on('data', (d) => {
				stderr += d
				process.stderr.write(d)
			})

			proc.on('close', (code) => {
				const duration_ms = Date.now() - start
				if (code === 0) {
					resolve({ status: 'passed', output: stdout, duration_ms })
				} else {
					resolve({ status: 'failed', output: stdout, error: stderr || `Exit code ${code}`, duration_ms })
				}
			})

			proc.on('error', (err) => {
				const duration_ms = Date.now() - start
				resolve({ status: 'failed', error: err.message, duration_ms })
			})
		})
	}
}
