import { UiCommand } from '../../cli/Ui.js'
import { parseArgv } from '../../cli/argvHelper.js'
import { Alert, Table } from '../../cli/components/index.js'
import { FileSystem } from '../../utils/FileSystem.js'
import { AI } from '../../llm/AI.js'
import { Chat } from '../../llm/Chat.js'
import { loadModels } from '../../Chat/index.js'
import { sendAndStream } from '../../llm/index.js'
import { MarkdownProtocol } from '../../utils/Markdown.js'
import { resolve, dirname } from 'node:path'

// ─────────────────────────────────────────────
// PipelineCommand — llimo pipeline:* subcommand
// Usage:
//   llimo pipeline:seed "App desc"
//   llimo pipeline:model --task task.md
//   llimo pipeline:contract "Create tests" --task task.md
// ─────────────────────────────────────────────

const STEP_NAMES = ['seed','model','contract','adapter','cli','chat','web','mobile','qa']

class PipelineOptions {
	static step = {
		help: 'Pipeline step (seed | model | contract | adapter | cli | chat | web | mobile | qa)',
		default: 'seed',
		options: STEP_NAMES,
	}

	static intent = {
		help: 'App description or task for this step (positional)',
		default: '',
		positional: true,
	}

	static task = {
		help: 'Path to task.md with []() file references to resolve',
		default: '',
	}

	constructor(input = {}) {
		/** @type {string} */
		this.step = input.step ?? 'seed'
		/** @type {string} */
		this.intent = input.intent ?? ''
		/** @type {string} */
		this.task = input.task ?? ''
	}
}

// ─────────────────────────────────────────────
// PipelineCommand
// ─────────────────────────────────────────────

export class PipelineCommand extends UiCommand {
	static name = 'pipeline'
	static help = 'Run a pipeline step. Uses --task task.md with []() refs, or inline intent.'

	constructor(data = {}) {
		super()
		/** @type {PipelineOptions} */
		this.options = new PipelineOptions(data.options || {})
		/** @type {FileSystem} */
		this.fs = data.fs || new FileSystem()
		/** @type {AI} */
		this.ai = data.ai || new AI()
	}

	async *run() {
		const step = this.options.step
		const stepIdx = STEP_NAMES.indexOf(step)
		if (stepIdx === -1) {
			yield new Alert({ text: `❌ Unknown step: ${step}`, variant: 'error' })
			return
		}
		const workflowName = `pipeline-no${stepIdx + 1}-${step}`

		yield new Alert({ text: `🚀 Pipeline step: ${step}`, variant: 'info' })
		const startTime = performance.now()

		// ── 1. Build system prompt from ALL session workflows ──
		const systemParts = []

		try {
			const sessionFiles = await this.fs.browse('.agent/session/workflows/', { recursive: false })
			for (const file of sessionFiles.sort()) {
				if (!file.endsWith('.md')) continue
				try {
					const content = await this.fs.readFile(`.agent/session/workflows/${file}`, 'utf-8')
					// Remove frontmatter if present
					const body = content.replace(/^---[\s\S]*?---\n?\n?/, '').trim()
					if (body) {
						systemParts.push(`# ${file}\n\n${body}`)
						yield new Alert({ text: `📄 Workflow: ${file}`, variant: 'debug' })
					}
				} catch {}
			}
		} catch (e) {
			yield new Alert({ text: `⚠️  No .agent/session/workflows/ found. Run ./bin/pipeline.sh first.`, variant: 'warn' })
		}

		yield new Alert({ text: `📚 Session: ${systemParts.length} workflows loaded`, variant: 'info' })

		// ── 2. Build user prompt (from --task or --intent) ──
		let userPrompt = this.options.intent || ''

		if (this.options.task) {
			try {
				const taskDir = dirname(resolve(process.cwd(), this.options.task))
				const rawTask = await this.fs.readFile(this.options.task, 'utf-8')

				// Resolve all []() references in the task markdown
				const alerts = []
				const resolved = await this.#resolveRefs(rawTask, taskDir, alerts, new Set([resolve(process.cwd(), this.options.task)]))
				for (const a of alerts) yield a

				userPrompt = resolved
				yield new Alert({ text: `📋 Task loaded: ${this.options.task}`, variant: 'info' })
			} catch (e) {
				yield new Alert({ text: `❌ Failed to load task: ${(/** @type {Error} */ (e)).message}`, variant: 'error' })
				return
			}
		}

		if (!userPrompt.trim()) {
			yield new Alert({ text: '❌ No task provided. Use --task task.md or inline intent.', variant: 'error' })
			return
		}

		// ── 3. Combine system + user ──
		const systemPrompt = systemParts.join('\n---\n')
		const totalChars = systemPrompt.length + userPrompt.length
		const estimatedTokens = Math.ceil(totalChars / 3)

		yield new Alert({
			text: `📊 Context: ~${estimatedTokens} tokens (${systemPrompt.length} chars system + ${userPrompt.length} chars user)`,
			variant: 'info',
		})

		// ── 4. Load AI models ──
		yield new Alert({ text: '🤖 Initializing AI...', variant: 'info' })
		const models = await loadModels({ ui: /** @type {any} */ ({ console }) })
		this.ai.setModels(models)
		const modelCount = models instanceof Map ? models.size : (/** @type {any[]} */ (models)).length || 0
		yield new Alert({ text: `✅ AI ready (${modelCount} models)`, variant: 'success' })

		// ── 5. Select model ──
		let model = this.ai.getModels()[0] || null
		const capable = this.ai.getModels()
			.filter(m => m.context_length && m.context_length > estimatedTokens * 1.2)
			.sort((a, b) => (a.pricing?.prompt || 0) - (b.pricing?.prompt || 0))

		if (capable?.length) {
			model = capable[0]
			yield new Alert({ text: `🔄 Auto-selected ${model.id}@${model.provider} (ctx: ${model.context_length})`, variant: 'info' })
		} else if (this.ai.getModels()?.length) {
			model = this.ai.getModels()[0]
			yield new Alert({ text: `   Using ${model.id}@${model.provider} (${model.context_length || '?'})`, variant: 'info' })
		} else {
			yield new Alert({ text: '❌ No models available', variant: 'error' })
			return
		}

		// ── 6. Create chat and send ──
		const chat = new Chat({
			system: { head: systemPrompt, body: '', vars: {} },
		})
		chat.add({ role: 'user', content: userPrompt })

		try {
			const sent = await sendAndStream({
				ai: this.ai,
				chat,
				ui: /** @type {any} */ ({ console }),
				prompt: userPrompt,
				model,
				step: 1,
				format: String,
				valuta: String,
			})

			const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
			yield new Alert({
				text: `✅ Step ${step} complete (${elapsed}s, ${sent.usage?.outputTokens || 0} output tokens)`,
				variant: 'success',
			})

			yield new Alert({ text: '⏳ Running tests...', variant: 'info' })
			const { execSync } = await import('node:child_process')
			try {
				const output = execSync('npm test', { encoding: 'utf-8', stdio: 'pipe' })
				yield new Alert({ text: `✅ Tests passed:\n${output.slice(0, 500).trim()}...`, variant: 'success' })
			} catch (err) {
				const error = /** @type {any} */ (err)
				yield new Alert({ text: `❌ Tests failed:\n${error.stdout?.slice(0, 500).trim() || error.message}`, variant: 'error' })
			}
		} catch (err) {
			const error = /** @type {any} */ (err)
			yield new Alert({ text: `❌ Failed: ${error.message || error}`, variant: 'error' })
		}

		yield false
	}

	/**
	 * Resolve all []() markdown references in text.
	 * Supports:
	 *   [](path/to/file)           — inject entire file as code block
	 *   [label](path/to/file)      — inject with label
	 *   [](task/subtask.md)        — nested task with its own []() refs
	 * @param {string} text
	 * @param {string} baseDir
	 * @param {Alert[]} alerts
	 * @returns {Promise<string>}
	 */
	async #resolveRefs(text, baseDir, alerts = [], resolvedFiles = new Set()) {
		let result = text
		const refRegex = /\[([^\]]*)\]\(([^)]+)\)/g
		const matches = [...text.matchAll(refRegex)]

		for (const match of matches) {
			const [fullMatch, label, refPath] = match
			if (refPath.startsWith('http')) continue // Skip URLs

			const absPath = resolve(baseDir, refPath.trim())
			const fileName = refPath.trim()

			if (resolvedFiles.has(absPath)) {
				result = result.replace(fullMatch, `<!-- duplicate ref: ${fileName} omitted -->`)
				continue
			}
			resolvedFiles.add(absPath)

			try {
				let content = await this.fs.readFile(absPath, 'utf-8')
				const ext = absPath.split('.').pop() || 'txt'
				const lang = ext === 'md' ? 'markdown' : ext === 'js' ? 'javascript' : ext

				if (lang === 'markdown') {
					content = await this.#resolveRefs(content, dirname(absPath), alerts, resolvedFiles)
				}

				// Pack as a code block
				const block = `\n#### [${fileName}](file://${absPath})\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n`
				result = result.replace(fullMatch, block)

				if (label) {
					alerts.push(new Alert({ text: `📎 ${label} → ${fileName}`, variant: 'debug' }))
				} else {
					alerts.push(new Alert({ text: `📎 ${fileName}`, variant: 'debug' }))
				}
			} catch {
				// If file not found, keep the reference as is
				alerts.push(new Alert({ text: `⚠️  Not found: ${fileName}`, variant: 'warn' }))
			}
		}

		return result
	}

	/**
	 * @param {{ argv?: string[], chat?: import('../../llm/Chat.js').Chat }} [input]
	 * @returns {PipelineCommand}
	 */
	static create(input = {}) {
		const { argv = [], chat } = input
		const opts = parseArgv(argv, PipelineOptions)
		return new PipelineCommand({
			options: opts,
			fs: new FileSystem(),
			ai: new AI(),
		})
	}
}
