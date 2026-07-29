import { Ui, UiCommand } from '../../cli/Ui.js'
import { parseArgv } from '../../cli/argvHelper.js'
import { show, progress } from '@nan0web/ui'
import { AI } from '../../llm/AI.js'
import { Chat } from '../../llm/Chat.js'
import { loadModels } from '../../Chat/models.js'
import { sendAndStream } from '../../llm/index.js'
import { FileProtocol } from '../../FileProtocol.js'
import { applyBoundaries } from '@nan0web/ai'
import llmCommands from '../../llm/commands/index.js'
import { generateSystemPrompt } from '../../llm/system.js'
import { resolve, dirname } from 'node:path'
import childProcess from 'node:child_process'
import readline from 'node:readline'
import { AiStrategyModel } from '../../domain/AiStrategyModel.js'
import { FileSystem } from '../../utils/FileSystem.js'
import { Suite } from '../../cli/testing/node.js'

// ─────────────────────────────────────────────
// PipelineCommand — llimo pipeline:* subcommand
// Usage:
//   llimo pipeline:seed "App desc"
//   llimo pipeline:model --task task.md
//   llimo pipeline:contract "Create tests" --task task.md
// ─────────────────────────────────────────────

/** @typedef {'seed'|'model'|'contract'|'adapter'|'cli'|'chat'|'web'|'mobile'|'qa'} PipelineStep */

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

	static model = {
		help: 'Model name or ID to use (e.g. llama3.1-8b, gpt-oss-120b)',
		default: '',
	}

	constructor(input = {}) {
		/** @type {string} */
		this.step = input.step ?? 'seed'
		/** @type {string} */
		this.intent = input.intent ?? ''
		/** @type {string} */
		this.task = input.task ?? ''
		/** @type {string} */
		this.model = input.model ?? ''
	}
}

// ─────────────────────────────────────────────
// PipelineCommand
// ─────────────────────────────────────────────

export class PipelineCommand extends UiCommand {
	/** @type {string} */
	step = 'seed'
	/** @type {string} */
	intent = ''
	/** @type {string} */
	task = ''
	/** @type {string} */
	model = ''
	/** @type {any} */
	db = null
	/** @type {any} */
	fs = null
	/** @type {any} */
	ai = null

	static name = 'pipeline'
	static description = 'Run a pipeline step. Uses --task task.md with []() refs, or inline intent.'

	static UI = {
		PACKAGE_JSON_NOT_FOUND: 'package.json not found',
		RUNNING_PNPM_INSTALL: 'Running pnpm install to link the workspace...',
		PROJECT_INITIALIZED: 'Project initialized successfully and linked to monorepo workspace!',
		PNPM_INSTALL_FAILED: 'pnpm install or agent setup failed: {$error}',
		MONOREPO_ROOT_NOT_FOUND: 'Could not locate monorepo root (no pnpm-workspace.yaml found in parent directories). skipping workspace linking.',
		UNKNOWN_STEP: 'Unknown step: {$step}',
		STEP_STARTED: 'Pipeline step: {$step}',
		FAILED_LOAD_BASE_PROMPT: 'Failed to load base system prompt template: {$error}',
		WORKFLOW_LOADED: 'Workflow: {$file}',
		NO_WORKFLOWS_FOUND: 'No .agent/session/workflows/ found.',
		SESSION_WORKFLOWS_LOADED: 'Session: {$count} workflows loaded',
		TASK_LOADED: 'Task loaded: {$task}',
		FAILED_LOAD_TASK: 'Failed to load task: {$error}',
		NO_TASK_PROVIDED: 'No task provided. Use --task task.md or inline intent.',
		CONTEXT_INFO: 'Context: ~{$tokens} tokens ({$systemChars} chars system + {$userChars} chars user)',
		INITIALIZING_AI: 'Initializing AI...',
		AI_READY: 'AI ready ({$count} models)',
		MODEL_NOT_FOUND: 'Requested model "{$model}" not found, falling back to auto-selection',
		AUTO_SELECTED_MODEL: 'Auto-selected {$model}@{$provider} (ctx: {$context})',
		USING_MODEL: 'Using {$model}@{$provider} ({$context})',
		SPECIFIED_MODEL: 'Using specified model: {$model}@{$provider} (ctx: {$context})',
		NO_MODELS_AVAILABLE: 'No models available',
		STEP_COMPLETE: 'Step {$step} complete ({$elapsed}s, {$tokens} output tokens)',
		EXTRACTING_FILES: 'Extracting files...',
		EXECUTING_COMMAND: 'Executing command: {$command}',
		UNKNOWN_COMMAND: 'Unknown command: {$command}',
		EXTRACTED_FILE: '  + {$file} ({$size})',
		PARSE_ERROR: 'Parse error in boundary: {$error} at line {$line}',
		RUNNING_TESTS: 'Running tests...',
		TESTS_PASSED: 'Tests passed:\n{$output}...',
		TESTS_FAILED: 'Tests failed:\n{$output}',
		NO_PACKAGE_JSON: 'No local package.json found, skipping test phase.',
		FAILED: 'Failed: {$error}',
		RESOLVED_REF: '📎 {$label} → {$file}',
		NOT_FOUND: 'Not found: {$file}',
	}

	/**
	 * @param {Partial<PipelineCommand>} [data={}]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		const opts = /** @type {any} */ (options)
		const d = /** @type {any} */ (data)
		/** @type {PipelineOptions} */
		this.options = new PipelineOptions(opts.options || d.options || d || {})
		this._ = {
			...this._,
			...(d._ || {}),
			...(opts || {}),
		}
		if (!this._.db) {
			this._.db = opts.db || d.db || d._?.db || d.fs
		}
		if (!this._.t) {
			this._.t = opts.t || d.t || d._?.t || ((/** @type {any} */ k) => k)
		}
		/** @type {AI} */
		this.ai = opts.ai || d.ai || d._?.ai || this._.ai || new AI()
	}

	t(key, params = {}) {
		return this._.t(key, params)
	}

	/**
	 * @param {string} path
	 * @returns {Promise<boolean>}
	 */
	async _dbHas(path) {
		const stat = await this._.db.statDocument(path)
		return Boolean(stat && stat.exists)
	}

	/**
	 * @param {string} path
	 * @param {any} [options]
	 * @returns {Promise<any>}
	 */
	async _dbGet(path, options) {
		return await this._.db.loadDocument(path)
	}

	/**
	 * @param {string} path
	 * @param {any} content
	 * @returns {Promise<void>}
	 */
	async _dbSet(path, content) {
		return await this._.db.saveDocument(path, content)
	}

	/**
	 * @param {string} path
	 * @param {any} [options]
	 * @returns {Promise<string[]>}
	 */
	async _dbBrowse(path, options) {
		const list = []
		const prefix = path && path !== '.' ? (path.endsWith('/') ? path : path + '/') : ''
		for await (const entry of this._.db.browse(path, options)) {
			let rel = entry.path || entry.name
			if (prefix && rel.startsWith(prefix)) {
				rel = rel.slice(prefix.length)
			}
			list.push(rel)
		}
		return list
	}

	/**
	 * @param {string} command
	 * @param {any} [options]
	 * @returns {any}
	 */
	execSync(command, options = {}) {
		return childProcess.execSync(command, options)
	}

	/**
	 * @param {string} command
	 * @param {string[]} args
	 * @param {any} [options]
	 * @returns {any}
	 */
	spawn(command, args, options = {}) {
		return childProcess.spawn(command, args, options)
	}

	async *ensureProjectInitialized() {
		const hasPackageJson = await this._dbHas('package.json')
		if (!hasPackageJson) {
			yield show(this.t(PipelineCommand.UI.PACKAGE_JSON_NOT_FOUND), 'info')

			const dirPath = process.cwd()
			const folderName = dirPath.split('/').pop() || 'new-app'

			const packageJson = {
				name: `@nan0web/${folderName}`,
				version: '1.0.0',
				type: 'module',
				scripts: {
					test: 'node --test --test-timeout=3000 "src/**/*.test.js"',
					'test:all': 'npm run test'
				},
				devDependencies: {
					'@nan0web/types': 'workspace:*'
				}
			}

			await this._dbSet('package.json', packageJson)

			const srcDir = 'src'
			if (typeof this._.db.mkdir === 'function') {
				await this._.db.mkdir(srcDir)
			} else if (this._.db.driver?.ensureDir) {
				await this._.db.driver.ensureDir(this._.db.absolute(srcDir))
			} else {
				await this._dbSet('src/.gitkeep', '')
			}
			await this._dbSet('src/.gitkeep', '')

			const { existsSync } = await import('node:fs')
			const { dirname, join } = await import('node:path')
			const { fileURLToPath } = await import('node:url')

			let monorepoRoot = ''
			let found = false

			try {
				const currentFile = fileURLToPath(import.meta.url)
				let dir = dirname(currentFile)
				while (dir && dir !== '/') {
					if (existsSync(join(dir, 'pnpm-workspace.yaml')) && existsSync(join(dir, 'bin/setup-agents.js'))) {
						monorepoRoot = dir
						found = true
						break
					}
					dir = dirname(dir)
				}
			} catch (e) {}

			if (!found) {
				monorepoRoot = dirPath
				while (monorepoRoot && monorepoRoot !== '/') {
					if (existsSync(join(monorepoRoot, 'pnpm-workspace.yaml'))) {
						found = true
						break
					}
					monorepoRoot = dirname(monorepoRoot)
				}
			}

			if (found) {
				yield show(this.t(PipelineCommand.UI.RUNNING_PNPM_INSTALL), 'info')
				try {
					if (process.env.NODE_ENV !== 'test') {
						this.execSync('pnpm install', { cwd: monorepoRoot, stdio: 'ignore' })
						this.execSync('node bin/setup-agents.js', { cwd: monorepoRoot, stdio: 'ignore' })
					}
					yield show(this.t(PipelineCommand.UI.PROJECT_INITIALIZED), 'success')
				} catch (err) {
					yield show(this.t(PipelineCommand.UI.PNPM_INSTALL_FAILED, { $error: /** @type {any} */ (err).message }), 'warn')
				}
			} else {
				yield show(this.t(PipelineCommand.UI.MONOREPO_ROOT_NOT_FOUND), 'warn')
			}
		}
	}

	/**
	 * Setup session workflows in the target database.
	 * @param {string} step
	 * @returns {Promise<number>}
	 */
	async setupSessionWorkflows(step) {
		const stepIdx = STEP_NAMES.indexOf(step)
		if (stepIdx === -1) return 0

		const { fileURLToPath } = await import('node:url')
		const { promises: fsPromises } = await import('node:fs')
		const { resolve, dirname, basename } = await import('node:path')

		const currentDir = dirname(fileURLToPath(import.meta.url))
		const workflowsSrcDir = resolve(currentDir, '../../../../../docs/uk/workflows')

		// 1. Get step workflows (common + step-specific)
		const common = [
			'architechnomag.md',
			'code-style.md',
			'anti-haste-protocol.md',
			'zero-tolerance-git.md',
			'zero-tolerance-grep.md',
			'cnai-context.md',
			'subagent.md',
		]

		const stepSpecific = {
			seed: [
				'pipeline-no1-seed.md',
				'seed-analysis.md',
				'project-md.md',
				'language-of-intent.md',
				'llimo.md'
			],
			model: [
				'pipeline-no2-model.md',
				'model-schema.md',
				'data-architecture.md',
				'data-integrity.md',
				'inspect-models.md'
			],
			contract: [
				'pipeline-no3-contract.md',
				'interface-welding.md',
				'olmui-scenario-test.md',
				'olm-ui-architecture-testing.md'
			],
			adapter: [
				'pipeline-no4-adapter.md',
				'olm-ui-architecture-adapters.md',
				'olm-ui-architecture-core.md'
			],
			cli: [
				'pipeline-no5-ui-cli.md',
				'ui-cli-standards.md',
				'olm-ui-architecture-core.md'
			],
			chat: [
				'pipeline-no6-ui-chat.md',
				'olm-ui-architecture-core.md'
			],
			web: [
				'pipeline-no7-ui-web.md',
				'olm-ui-architecture-core.md',
				'i18n-standards.md'
			],
			mobile: [
				'pipeline-no8-ui-mobile.md',
				'olm-ui-architecture-core.md'
			],
			qa: [
				'pipeline-no9-qa.md',
				'package-hygiene.md',
				'check.md',
				'check-all.md'
			]
		}

		const filesToCopy = [...common, ...(stepSpecific[step] || [])]

		let copied = 0
		const workflowsList = []

		for (const filename of filesToCopy) {
			const srcPath = resolve(workflowsSrcDir, filename)
			try {
				const content = await fsPromises.readFile(srcPath, 'utf8')
				const destPath = `.agent/session/workflows/${filename}`
				await this._dbSet(destPath, content)
				workflowsList.push(filename)
				copied++
			} catch (err) {
				// Skip missing files
			}
		}

		// 3. Generate index.md
		if (workflowsList.length > 0) {
			let indexContent = `# Session: ${step}\n\n`
			for (const wf of workflowsList) {
				const name = basename(wf, '.md')
				indexContent += `- [${name}](./workflows/${wf})\n`
			}
			await this._dbSet('.agent/session/index.md', indexContent)
		}

		return copied
	}

	async *run() {
		const step = this.options.step
		const stepIdx = STEP_NAMES.indexOf(step)
		if (stepIdx === -1) {
			yield show(this.t(PipelineCommand.UI.UNKNOWN_STEP, { $step: step }), 'error')
			return
		}

		yield* this.ensureProjectInitialized()

		// Copy workflows and generate index.md for this session
		await this.setupSessionWorkflows(step)

		const workflowName = `pipeline-no${stepIdx + 1}-${step}`

		yield show(this.t(PipelineCommand.UI.STEP_STARTED, { $step: step }), 'info')
		const startTime = performance.now()

		// ── 1. Build system prompt (base + whitelisted session workflows) ──
		const systemParts = []

		try {
			const basePrompt = await generateSystemPrompt()
			if (basePrompt) {
				systemParts.push(basePrompt)
			}
		} catch (e) {
			yield show(this.t(PipelineCommand.UI.FAILED_LOAD_BASE_PROMPT, { $error: /** @type {any} */ (e).message }), 'warn')
		}

		const getStepWorkflows = (stepName) => {
			const common = [
				'architechnomag.md',
				'code-style.md',
				'anti-haste-protocol.md',
				'zero-tolerance-git.md',
				'zero-tolerance-grep.md',
				'cnai-context.md',
				'subagent.md',
			]

			const stepSpecific = {
				seed: [
					'pipeline-no1-seed.md',
					'seed-analysis.md',
					'project-md.md',
					'language-of-intent.md',
					'llimo.md'
				],
				model: [
					'pipeline-no2-model.md',
					'model-schema.md',
					'data-architecture.md',
					'data-integrity.md',
					'inspect-models.md'
				],
				contract: [
					'pipeline-no3-contract.md',
					'interface-welding.md',
					'olmui-scenario-test.md',
					'olm-ui-architecture-testing.md'
				],
				adapter: [
					'pipeline-no4-adapter.md',
					'olm-ui-architecture-adapters.md',
					'olm-ui-architecture-core.md'
				],
				cli: [
					'pipeline-no5-ui-cli.md',
					'ui-cli-standards.md',
					'olm-ui-architecture-core.md'
				],
				chat: [
					'pipeline-no6-ui-chat.md',
					'olm-ui-architecture-core.md'
				],
				web: [
					'pipeline-no7-ui-web.md',
					'olm-ui-architecture-core.md',
					'i18n-standards.md'
				],
				mobile: [
					'pipeline-no8-ui-mobile.md',
					'olm-ui-architecture-core.md'
				],
				qa: [
					'pipeline-no9-qa.md',
					'package-hygiene.md',
					'check.md',
					'check-all.md'
				]
			}

			return new Set([...common, ...(stepSpecific[stepName] || [])])
		}

		const allowedWorkflows = getStepWorkflows(step)

		try {
			const sessionFiles = await this._dbBrowse('.agent/session/workflows/', { recursive: false })
			for (const file of sessionFiles.sort()) {
				if (!file.endsWith('.md')) continue
				if (!allowedWorkflows.has(file)) continue
				try {
					const content = await this._dbGet(`.agent/session/workflows/${file}`)
					// Remove frontmatter if present
					const body = content.replace(/^---[\s\S]*?---\n?\n?/, '').trim()
					if (body) {
						systemParts.push(`# ${file}\n\n${body}`)
						yield show(this.t(PipelineCommand.UI.WORKFLOW_LOADED, { $file: file }), 'info')
					}
				} catch {}
			}
		} catch (e) {
			yield show(this.t(PipelineCommand.UI.NO_WORKFLOWS_FOUND), 'warn')
		}

		yield show(this.t(PipelineCommand.UI.SESSION_WORKFLOWS_LOADED, { $count: String(systemParts.length) }), 'info')

		if (!this.options.intent && !this.options.task && step !== 'seed') {
			const possiblePaths = ['docs/uk/project.md', 'project.md', 'docs/seed.md', 'seed.md']
			for (const p of possiblePaths) {
				if (await this._dbHas(p)) {
					this.options.task = p
					break
				}
			}
		}

		// ── 2. Build user prompt (from --task or --intent) ──
		let userPrompt = this.options.intent || ''

		if (this.options.task) {
			try {
				const taskDir = dirname(resolve(process.cwd(), this.options.task))
				const rawTask = await this._dbGet(this.options.task)

				// Resolve all []() references in the task markdown
				const alerts = []
				const resolved = await this.#resolveRefs(rawTask, taskDir, alerts, new Set([resolve(process.cwd(), this.options.task)]))
				for (const a of alerts) yield a

				userPrompt = resolved
				yield show(this.t(PipelineCommand.UI.TASK_LOADED, { $task: this.options.task }), 'info')
			} catch (e) {
				yield show(this.t(PipelineCommand.UI.FAILED_LOAD_TASK, { $error: (/** @type {Error} */ (e)).message }), 'error')
				return
			}
		}

		if (!userPrompt.trim()) {
			yield show(this.t(PipelineCommand.UI.NO_TASK_PROVIDED), 'error')
			return
		}

		// ── 2.5 Inject existing project context if non-empty ──
		let contextPrompt = ""
		const existingFiles = []
		try {
			const files = await this._dbBrowse(".", { recursive: true, ignore: ['node_modules', '.git', '.agent', '.test_home', 'package-lock.json', 'pnpm-lock.yaml'] })
			for (const f of files) {
				if (f.startsWith(".agent") || f.startsWith(".git") || f.includes("node_modules") || f === "package.json") {
					continue
				}
				existingFiles.push(f)
			}
		} catch {}

		if (existingFiles.length > 0) {
			contextPrompt += "\n\n# Existing Project Context\n"
			contextPrompt += "This is an existing project. Below are the contents of the files in the workspace:\n"
			for (const file of existingFiles.sort()) {
				if (file.endsWith('.js') || file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml')) {
					try {
						const content = await this._dbGet(file)
						const ext = file.split('.').pop()
						const lang = ext === 'js' ? 'javascript' : ext === 'json' ? 'json' : ext === 'md' ? 'markdown' : 'yaml'
						contextPrompt += `\nFile \`${file}\`:\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n`
					} catch {}
				} else {
					contextPrompt += `- ${file} (binary/other)\n`
				}
			}
		}

		if (contextPrompt) {
			userPrompt += contextPrompt
		}

		let stepActionPrompt = ''
		if (step === 'seed') {
			stepActionPrompt = '\n\n# Action Command\nYour task is to analyze the user intent, filter out any negations (Language of Intent), and generate the initial project documentation: `project.md` and `user-stories.md` under the root directory. Do NOT write any application source code in `src/` or tests yet. Write the files directly without asking any questions.'
		} else if (step === 'model') {
			stepActionPrompt = '\n\n# Action Command\nYour task is to analyze the project specification (project.md/seed.md) and User Stories, then automatically design and generate the Domain Models (*Model.js) under the `src/domain/` directory using the Model-as-Schema pattern. Write the code directly without asking any questions.'
		} else if (step === 'contract') {
			stepActionPrompt = '\n\n# Action Command\nYour task is to analyze the domain models and project specification, then automatically generate contract and scenario tests under the `src/` directory (e.g. `src/domain/Todo.story.js` or `src/todo.test.js`) to cover the User Stories. Write the tests directly without asking any questions.'
		} else if (step === 'adapter') {
			stepActionPrompt = '\n\n# Action Command\nYour task is to analyze the domain models and generate the UI Adapter class to map inputs to the domain model. Write the code directly without asking any questions.'
		} else if (step === 'cli') {
			stepActionPrompt = '\n\n# Action Command\nYour task is to generate the interactive console command line interface (CLI) for the application (usually in `src/cli/` or `bin/`). Write the code directly without asking any questions.'
		} else if (step === 'web') {
			stepActionPrompt = '\n\n# Action Command\nYour task is to generate the Lit-based Web UI component structure for the application. Write the code directly without asking any questions.'
		} else if (step === 'qa') {
			stepActionPrompt = '\n\n# Action Command\nYour task is to run the final QA verification, check types, packages, hygiene and ensure all tests pass.'
		}

		if (stepActionPrompt) {
			stepActionPrompt += '\n\nIMPORTANT FORMAT REQUIREMENT: You MUST use either the Boundary format (highly recommended) or Markdown format to return your files.\n\nBoundary Format Example (Use this if any file contains nested code fences or mermaid diagrams):\n---boundary:project.md---\n# Project: Simple Todo App\n...\n---boundary---\n\n---boundary:user-stories.md---\n# User Stories\n...\n---boundary---\n\n---boundary:@validate---\n- [project.md](project.md)\n- [user-stories.md](user-stories.md)\n---boundary---\n\nMarkdown Format Example:\n#### [project.md](project.md)\n```markdown\n# Project: Simple Todo App\n...\n```\n\n#### [user-stories.md](user-stories.md)\n```markdown\n# User Stories\n...\n```\n\n#### [2 file(s), 0 command(s)](@validate)\n```markdown\n- [project.md](project.md)\n- [user-stories.md](user-stories.md)\n```\n\nNote: If any file contains nested markdown code fences (like ```), you MUST use the Boundary format to prevent parsing errors.';
			userPrompt += stepActionPrompt
		}

		// ── 3. Combine system + user ──
		const systemPrompt = systemParts.join('\n---\n')
		const totalChars = systemPrompt.length + userPrompt.length
		const estimatedTokens = Math.ceil(totalChars / 3)

		yield show(
			this.t(PipelineCommand.UI.CONTEXT_INFO, {
				$tokens: String(estimatedTokens),
				$systemChars: String(systemPrompt.length),
				$userChars: String(userPrompt.length),
			}),
			'info'
		)

		const ui = new Ui({ console: /** @type {any} */ (console) })

		// ── 4. Load AI models ──
		yield show(this.t(PipelineCommand.UI.INITIALIZING_AI), 'info')
		const models = await loadModels({ ui })
		this.ai.setModels(models)
		const modelCount = models instanceof Map ? models.size : (/** @type {any[]} */ (models)).length || 0
		yield show(this.t(PipelineCommand.UI.AI_READY, { $count: String(modelCount) }), 'success')

		// ── 5. Select model ──
		let model = null
		const modelId = this.options.model || process.env.LLIMO_MODEL

		if (modelId) {
			model = this.ai.findModel(modelId)
			if (!model) {
				yield show(this.t(PipelineCommand.UI.MODEL_NOT_FOUND, { $model: modelId }), 'warn')
			}
		}

		if (!model) {
			const capable = this.ai.getModels()
				.filter(m => m.context_length && m.context_length > estimatedTokens * 1.2)
				.sort((a, b) => (a.pricing?.prompt || 0) - (b.pricing?.prompt || 0))

			if (capable?.length) {
				model = capable[0]
				yield show(this.t(PipelineCommand.UI.AUTO_SELECTED_MODEL, { $model: model.id, $provider: model.provider, $context: String(model.context_length) }), 'info')
			} else if (this.ai.getModels()?.length) {
				model = this.ai.getModels()[0]
				yield show(this.t(PipelineCommand.UI.USING_MODEL, { $model: model.id, $provider: model.provider, $context: String(model.context_length || '?') }), 'info')
			} else {
				yield show(this.t(PipelineCommand.UI.NO_MODELS_AVAILABLE), 'error')
				return
			}
		} else {
			yield show(this.t(PipelineCommand.UI.SPECIFIED_MODEL, { $model: model.id, $provider: model.provider, $context: String(model.context_length) }), 'success')
		}

		// ── 6. Load strategy ──
		let strategy
		try {
			const loaded = await AiStrategyModel.loadFromProject(new FileSystem())
			strategy = loaded.strategy
			if (loaded.source === 'default') {
				yield show('⚠️ No .agent/strategy.nan0 found, using defaults. Run `llimo strategy` to configure.', 'warn')
			}
		} catch {
			strategy = new AiStrategyModel()
		}

		// ── 7. Create chat and send ──
		const chat = new Chat({
			system: { head: systemPrompt, body: '', vars: {} },
		})
		chat.add({ role: 'system', content: systemPrompt })

		try {
			const sent = await sendAndStream({
				ai: this.ai,
				chat,
				ui,
				prompt: userPrompt,
				model,
				strategy,
				step: 1,
				format: String,
				valuta: String,
			})

			const elapsed = ((performance.now() - startTime) / 1000).toFixed(1)
			yield show(
				this.t(PipelineCommand.UI.STEP_COMPLETE, {
					$step: step,
					$elapsed: elapsed,
					$tokens: String(sent.usage?.outputTokens || 0),
				}),
				'success'
			)

			// ── 7. Parse boundaries and save files ──
			const parsed = await FileProtocol.parseAdaptive(sent.answer)
			const { correct = [], failed = [] } = parsed

			yield show(this.t(PipelineCommand.UI.EXTRACTING_FILES), 'info')
			for (const file of correct) {
				const { filename = "", content = "", encoding = "utf-8" } = file
				const text = String(content)
				if (filename.startsWith("@")) {
					const commandName = filename.slice(1)
					yield show(this.t(PipelineCommand.UI.EXECUTING_COMMAND, { $command: filename }), 'info')
					const Cmd = llmCommands.get(commandName)
					if (Cmd) {
						const cmd = new Cmd({ cwd: process.cwd(), file, parsed })
						for await (const line of cmd.run()) {
							yield show(String(line), 'info')
						}
					} else {
						yield show(this.t(PipelineCommand.UI.UNKNOWN_COMMAND, { $command: filename }), 'warn')
					}
				} else if (text.trim() !== "") {
					if (file.startLine != null && file.lineCount != null) {
						const original = String(await this._dbGet(filename) || "")
						const key = `${filename}:${file.startLine}:${file.lineCount}`
						const updated = applyBoundaries(
							{ [filename]: original },
							{ [key]: text }
						)
						await this._dbSet(filename, updated[filename])
						yield show(`✏️ Snippet applied to ${filename} (lines ${file.startLine}-${file.startLine + file.lineCount - 1})`, 'success')
					} else {
						await this._dbSet(filename, text)
						const size = Buffer.byteLength(text)
						const sizeStr = (size / 1024).toFixed(1) + ' KB'
						yield show(this.t(PipelineCommand.UI.EXTRACTED_FILE, { $file: filename, $size: sizeStr }), 'success')
					}
				}
			}

			if (failed.length) {
				for (const err of failed) {
					yield show(this.t(PipelineCommand.UI.PARSE_ERROR, { $error: err.error, $line: String(err.line) }), 'warn')
				}
			}

			// ── 8. Run tests if package.json exists locally ──
			const hasPackageJson = await this._dbHas('package.json')
			if (hasPackageJson) {
				yield show(this.t(PipelineCommand.UI.RUNNING_TESTS), 'info')
				let output = ''
				let exitCode = 0
				try {
					if (process.env.NODE_ENV !== 'test') {
						const result = yield* this._runTestsWithStreaming()
						output = result.output
						exitCode = result.exitCode
					} else {
						output = this.execSync('npm test', { encoding: 'utf-8' })
						const lines = output.split('\n')
						let lineCount = 0
						for (const line of lines) {
							if (line.trim()) {
								lineCount++
								const value = (lineCount % 20) / 20
								yield progress(line, value, { id: 'tests' })
							}
						}
						// Clean up the progress bar at the end of the test stream
						yield progress('', 0, { id: 'tests', stop: true })
					}
				} catch (err) {
					const error = /** @type {any} */ (err)
					exitCode = error.status || 1
					output = (error.stdout || '') + '\n' + (error.stderr || '')
				}

				const suite = new Suite({ rows: output.split('\n'), fs: new FileSystem() })
				const parsed = suite.parse()
				const counts = parsed.counts
				const pass = counts.get('pass') || 0
				const fail = counts.get('fail') || 0
				const cancelled = counts.get('cancelled') || 0
				const skip = counts.get('skip') || 0
				const todo = counts.get('todo') || 0
				const duration = counts.get('duration') || 0
				const tests = counts.get('tests') || 0

				const summary = `Tests: ${tests}, Pass: ${pass}, Fail: ${fail}, Cancelled: ${cancelled}, Skip: ${skip}, Todo: ${todo} (${duration}ms)`
				if (exitCode !== 0 || fail > 0 || cancelled > 0) {
					yield show(`❌ ${summary}`, 'error')
				} else {
					yield show(`✅ ${summary}`, 'success')
				}
			} else {
				yield show(this.t(PipelineCommand.UI.NO_PACKAGE_JSON), 'info')
			}
		} catch (err) {
			console.error('PIPELINE COMMAND CRASHED:', err)
			const error = /** @type {any} */ (err)
			yield show(this.t(PipelineCommand.UI.FAILED, { $error: error.message || String(error) }), 'error')
		}

		yield false
	}

	/**
	 * Run tests and stream output line by line.
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { output: string, exitCode: number }>}
	 */
	async * _runTestsWithStreaming() {
		const cp = this.spawn('npm', ['test'], { shell: true, stdio: ['ignore', 'pipe', 'pipe'] })
		const lines = []
		let done = false
		/** @type {(() => void) | null} */
		let resolveNext = null
		let output = ''

		const rlStdout = readline.createInterface({ input: cp.stdout })
		const rlStderr = readline.createInterface({ input: cp.stderr })

		/**
		 * @param {string} line
		 */
		const pushLine = (line) => {
			lines.push(line)
			output += line + '\n'
			if (resolveNext) {
				resolveNext()
				resolveNext = null
			}
		}

		rlStdout.on('line', pushLine)
		rlStderr.on('line', pushLine)

		let exitCode = 0
		const cpPromise = new Promise((resolve) => {
			cp.on('close', (code) => {
				exitCode = code || 0
				done = true
				if (resolveNext) {
					resolveNext()
					resolveNext = null
				}
				resolve(null)
			})
			cp.on('error', (err) => {
				output += '\n' + (err.message || String(err))
				done = true
				if (resolveNext) {
					resolveNext()
					resolveNext = null
				}
				resolve(null)
			})
		})

		let lineCount = 0
		while (lines.length > 0 || !done) {
			if (lines.length === 0) {
				await new Promise((resolve) => {
					resolveNext = /** @type {any} */ (resolve)
				})
			}
			while (lines.length > 0) {
				const line = lines.shift()
				if (line !== undefined) {
					lineCount++
					const value = (lineCount % 20) / 20
					yield progress(line, value, { id: 'tests' })
				}
			}
		}

		// Clean up the progress bar at the end of the test stream
		yield progress('', 0, { id: 'tests', stop: true })

		await cpPromise
		return { output, exitCode }
	}

	/**
	 * Resolve all []() markdown references in text.
	 * Supports:
	 *   [](path/to/file)           — inject entire file as code block
	 *   [label](path/to/file)      — inject with label
	 *   [](task/subtask.md)        — nested task with its own []() refs
	 * @param {string} text
	 * @param {string} baseDir
	 * @param {any[]} alerts
	 * @returns {Promise<string>}
	 */
	async #resolveRefs(text, baseDir, alerts = [], resolvedFiles = new Set()) {
		const { relative } = await import('node:path')
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
				const relPath = relative(process.cwd(), absPath)
				let content = await this._dbGet(relPath)
				const ext = absPath.split('.').pop() || 'txt'
				const lang = ext === 'md' ? 'markdown' : ext === 'js' ? 'javascript' : ext

				if (lang === 'markdown') {
					content = await this.#resolveRefs(content, dirname(absPath), alerts, resolvedFiles)
				}

				// Pack as a code block
				const block = `\n#### [${fileName}](file://${absPath})\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n`
				result = result.replace(fullMatch, block)

				if (label) {
					alerts.push(show(this.t(PipelineCommand.UI.RESOLVED_REF, { $label: label, $file: fileName }), 'info'))
				} else {
					alerts.push(show(this.t(PipelineCommand.UI.RESOLVED_REF, { $label: '', $file: fileName }), 'info'))
				}
			} catch {
				// If file not found, keep the reference as is
				alerts.push(show(this.t(PipelineCommand.UI.NOT_FOUND, { $file: fileName }), 'warn'))
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
			ai: new AI(),
		}, {
			db: /** @type {any} */ (chat?.db)
		})
	}
}
