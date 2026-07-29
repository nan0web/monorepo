import { randomUUID } from 'node:crypto'
import path from 'node:path'

import { show, ask, result, progress, ModelAsApp } from '@nan0web/ui'
import { SearchSourcesIntent, applyBoundaries } from '@nan0web/ai'
import { TapParser } from '@nan0web/test/parsers'
/**
 * @todo get rid of the DBFS and use abstract DB instead
 */
import DBFS from '@nan0web/db-fs'

import { AiModelAsApp } from './AiModelAsApp.js'
import { AiStrategyModel } from '../strategy/AiStrategyModel.js'
import { StrictBoundaryInterpreter } from '../../utils/StrictBoundaryInterpreter.js'
import { StatsLogger } from '../../utils/StatsLogger.js'
import { Command, GetCommand, LsCommand, SearchCommand, WorkflowCommand } from './commands/index.js'
import { BoundaryProtocol } from '../co/BoundaryProtocol.js'

/**
 * @typedef {Object} Attachment
 * @property {string} filename
 * @property {string} content
 * @property {number | undefined} [startLine]
 * @property {number | undefined} [lineCount]
 */

/**
 * @typedef {Object} Message
 * @property {string} role
 * @property {string} content
 */

/**
 * @typedef {Object} ChatSessionContext
 * @property {boolean} singleShot
 * @property {Message[]} extraSystemMessages
 * @property {number} agentIterations
 * @property {Message[]} messages
 */

/**
 * ChatSessionModel for llimo.v3
 */
export class ChatSessionModel extends AiModelAsApp {
	static alias = 'chat'
	static commands = [GetCommand, LsCommand, SearchCommand, WorkflowCommand]

	static UI = {
		welcome: 'LLiMo Chat Session: {id} ({date})',
		errorNoAi: 'AI engine not injected',
		errorNoDb: 'DB not injected',
		errorNoChatDb: 'Chat DB not injected',
		errorSavingMeta: 'Error saving meta',
		confirm_execute_command: 'Do you want to execute command: {command}?',
		confirm_save_files: 'Do you want to save the modified files?',
		files_to_save: 'Files to save:',
		no_strategic_cascade: 'All models in the strategic cascade queue failed.',
		continue_loading: 'Continuing from session: {id}',
		continue_replay: 'Replaying response from previous session...',
		continue_healing: 'Previous response had format error. Requesting model to reformat...',
		continue_resend: 'Re-sending last prompt to model...',
		continue_no_session: 'No previous session found to continue.',
		trying_model: 'Trying model: {modelId}...',
		model_failed: 'Model {modelId} failed: {error}',
		file_changes_discarded: 'File changes discarded.',
		saved_file: 'Saved file: {filename}',
		syntax_error: 'Syntax error in file {filename}: {error}',
		files_not_saved: '{count} file(s) with errors were not saved',
		loading_workflow: 'Loading workflow: {name}',
		workflow_loaded: 'Workflow loaded: {name}',
		workflow_not_found: 'Workflow not found: {name}',
		executing_command: 'Executing command: {command}...',
		command_succeeded: 'Command succeeded: {output}',
		command_failed: 'Command failed with code {code}:\n{output}',
		skipped_command: 'Skipped execution of command: {command}',
		executing_test_suite: 'Executing test suite...',
		tests_passed: 'Tests passed: {output}',
		tests_failed: 'Tests failed: {output}',
		running_linter: 'Running linter/formatter...',
		lint_passed: 'Lint passed: {output}',
		lint_failed: 'Lint failed: {output}',
		running_validator: 'Running project validator...',
		validator_passed: 'Project validator passed: {output}',
		validator_failed: 'Project validator failed: {output}',
		streaming: 'Streaming...',
		streaming_finished: 'Streaming finished',
		injected_files_summary: 'Injected {count} files into context ({bytes} bytes)',
		session_logs_saved: 'Session logs saved: {path}',
		prompt_details: 'Prompt: {bytes} bytes (~{tokens} tokens)',
		metrics_summary:
			'Metrics: promptTokens: {promptTokens}, completionTokens: {completionTokens}, duration: {duration}s, cost: ${cost}',
		skipping_model_context_overflow:
			'Skipping model {modelId}: estimated prompt tokens ({estimatedTokens}) exceeds model context limit ({contextLimit})',
		run_tests_option: 'Run tests (pnpm test)',
		run_lint_option: 'Run linter/formatter check (npm run lint)',
		run_validate_option: 'Run project validators (pnpm test:validate)',
		continue_session_option: 'Continue chat session',
		verification_help: 'Select post-generation verification action:',
		auto_verify_running: 'Auto-verify: running tests...',
		auto_verify_passed: 'Auto-verify: tests passed on attempt {attempt}/{max}',
		auto_verify_failed:
			'Auto-verify: tests failed (attempt {attempt}/{max}) with {failCount} error(s). Sending errors back to model.',
		auto_verify_exhausted:
			'Auto-verify: maximum retries ({max}) exhausted. Manual intervention required.',
		auto_verify_progress:
			'Progress detected: failures decreased from {prev} to {curr}. Extending retries.',
		auto_verify_degradation:
			'TDD degradation or stagnation: failures did not decrease (previous: {prev}, current: {curr}, degradation count: {degradationCount}/{maxDegradations}).',
		auto_verify_switching_model:
			'Switching active model in strategic cascade queue to: {modelId}',
		auto_verify_aborted_degradation:
			'TDD healing aborted due to continuous degradation/stagnation.',
		auto_verify_prompt:
			'Previous test run failed (attempt {attempt}/{max}):\n```\n{errors}\n```\nPlease fix the code based on the error output above.',
		llmErrorFormatValidation:
			'Your previous response failed format validation: {error}.\n\nPlease reformat your ENTIRE response using the strict boundary format. Every file must be wrapped in boundary blockes:\n---boundary:filename---\n ...\n ---boundary---\n Do NOT use markdown code blocks for files tool, only use markdown when it is a file content you need to response with.',
	}

	static id = {
		help: 'Unique identifier for the chat session',
		default: null,
		type: 'string',
	}

	static date = {
		help: 'Date of chat',
		default: null,
		type: Date,
	}

	static input = {
		help: 'Initial input prompt or path to file',
		default: '',
		type: 'text',
		positional: true,
	}

	static model = {
		help: 'AI model override for the session',
		default: '',
	}

	static logsPath = {
		help: 'Absolute path to the directory hosting the chat artifacts',
		default: '',
	}

	static status = {
		help: 'Current status of the execution: active, ok, failed',
		default: 'active',
	}

	static communication = {
		help: 'Communication format: boundary',
		default: 'boundary',
	}

	static workflow = {
		help: 'Specific workflows to load',
		alias: 'w',
		multiple: true,
		type: 'string',
		default: () => [],
	}

	static autoVerify = {
		help: 'Automatically run tests after file save and retry on failure',
		alias: 'a',
		type: 'boolean',
		default: false,
	}

	static maxRetries = {
		help: 'Maximum number of auto-verify retry cycles',
		type: 'number',
		default: 3,
	}

	static continue = {
		help: 'Continue from previous failed/interrupted session',
		alias: 'c',
		type: 'boolean',
		default: false,
	}

	/**
	 * @param {Partial<ChatSessionModel> | Record<string, any>} [data]
	 * @param {Partial<import('./AiModelAsApp.js').AiModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		if (!data.date) {
			const today = new Date()
			const yyyy = today.getFullYear()
			const mm = String(today.getMonth() + 1).padStart(2, '0')
			const dd = String(today.getDate()).padStart(2, '0')
			data.date = `${yyyy}-${mm}-${dd}`
		}
		super(data, options)
		/** @type {string} Chat session identifier */ this.id
		/** @type {Date} Created chat date */ this.date
		/** @type {string} Initial input prompt or path to file */ this.input
		/** @type {string} AI model override for the session */ this.model
		/** @type {string} Absolute path to the directory hosting the chat artifacts */ this.logsPath
		/** @type {'active' | 'ok' | 'failed'} Current status of the execution */ this.status
		/** @type {'boundary' | 'markdown'} Communication format: boundary */ this.communication
		/** @type {string | string[]} Specific workflows to load */ this.workflow
		/** @type {boolean} Automatically run tests after file save */ this.autoVerify
		/** @type {number} Maximum number of auto-verify retry cycles */ this.maxRetries
		/** @type {boolean} Continue from previous session */ this.continue
		/** @type {string[]} List of positional file paths */ this._positionals
		/** @type {Map<string, number>} Map of injected files and sizes */ this.injectedFiles =
			new Map()
		/** @type {Map<string, typeof Command>} Map of command handlers */ this.commandsRegistry =
			new Map()
		for (const command of ChatSessionModel.commands) {
			this.commandsRegistry.set(command.alias, command)
		}
		/** @type {string | undefined} */
		this.statsBaseDir = /** @type {any} */ (options).statsBaseDir
		/** @type {string[]} */
		this.savedFiles = []
		/** @type {number} */
		this._currentModelIndex = 0
		/** @type {number} */
		this._previousFailCount = Infinity
		/** @type {number} */
		this._degradationCount = 0
		/** @type {number} */
		this._tddAttempts = 0
	}

	/**
	 * Build the system prompt from data/{locale}/system.md.
	 * Injects the list of available workflow files into <!--WORKFLOWS_INDEX-->.
	 * @param {string} [locale='uk']
	 * @returns {Promise<string>}
	 */
	async buildSystemPrompt(locale = 'uk') {
		const { db } = /** @type {any} */ (this._)
		if (!db) return ''

		// 1. Load base system.md
		let systemMd = ''
		try {
			systemMd = await db.loadDocumentAs('.txt', `@data/${locale}/system.md`)
			if (typeof systemMd !== 'string') systemMd = ''
		} catch (e) {
			// No system.md found — proceed with empty
		}

		// 2. List available workflows
		let workflowsIndex = ''
		try {
			const entries = new Set()
			try {
				const registry = await this.getPlatformRegistry()
				for (const wfName of Object.keys(registry.workflows)) {
					if (wfName.endsWith('.md')) {
						entries.add(wfName)
					} else {
						entries.add(`${wfName}.md`)
					}
				}
			} catch (e) {}

			try {
				for await (const entry of db.readDir(`@data/${locale}/workflows`)) {
					if (entry && (entry.uri || entry.path || entry.name)) {
						const full = entry.uri || entry.path || entry.name
						const name = String(full).split('/').pop() || full
						if (String(name).endsWith('.md')) entries.add(name)
					}
				}
			} catch (e) {}

			if (entries.size > 0) {
				workflowsIndex = Array.from(entries)
					.map((n) => `- ${n}`)
					.join('\n')
			}
		} catch (e) {
			// No workflows directory — proceed without index
		}

		let prompt = systemMd.replace('<!--WORKFLOWS_INDEX-->', workflowsIndex)

		// 3. Load specific workflows
		const wfList = Array.isArray(this.workflow)
			? [...this.workflow]
			: typeof this.workflow === 'string'
				? this.workflow
						.split(',')
						.map((s) => s.trim())
						.filter(Boolean)
				: []

		// Auto-detect nan0web workspace
		let isNan0Web = false
		try {
			const rootPkg = await db.loadDocument('package.json', {})
			if (rootPkg && rootPkg.name) {
				if (rootPkg.name.startsWith('@nan0web/') || rootPkg.name.startsWith('@industrialbank/')) {
					isNan0Web = true
				}
			}
			if (
				(await db.exists('nan0web.nan0')) ||
				(await db.exists('project.yaml')) ||
				(await db.exists('project.md'))
			) {
				isNan0Web = true
			}
		} catch (e) {}

		// Auto-detect scaffold intention and current development phase
		const lowerPrompt = String(this.input || '').toLowerCase()
		const isTesting =
			typeof globalThis.it === 'function' ||
			process.env.NODE_ENV === 'test' ||
			process.argv.some((arg) => arg.includes('test'))

		let isScaffoldRequest = false
		let currentPhase = '1-seed'

		const { pipelinePhase, pipelineWorkflows } = /** @type {any} */ (this._ || {})

		if (pipelineWorkflows && Array.isArray(pipelineWorkflows)) {
			isScaffoldRequest = true
			currentPhase = pipelinePhase || '1-seed'
			for (const wf of pipelineWorkflows) {
				if (!wfList.includes(wf) && !wfList.includes(`${wf}.md`)) {
					wfList.push(wf)
				}
			}
		} else if (isTesting) {
			isScaffoldRequest = lowerPrompt.includes('створи') || lowerPrompt.includes('create')
		} else {
			try {
				const fsMod = await import('node:fs')
				const fsPromises = await import('node:fs/promises')
				const pathMod = await import('node:path')
				const cwd = process.cwd()

				const hasPackageJson = fsMod.existsSync(pathMod.join(cwd, 'package.json'))
				let filesCount = 0
				try {
					const files = await fsPromises.readdir(cwd)
					filesCount = files.filter((f) => !f.startsWith('.')).length
				} catch (e) {}

				// Abstract scaffold detection: empty directory or lack of package.json
				isScaffoldRequest = !hasPackageJson || filesCount === 0

				if (isNan0Web || isScaffoldRequest) {
					// Check project description files in any language or canonical path
					const hasDescription =
						fsMod.existsSync(pathMod.join(cwd, 'project.md')) ||
						fsMod.existsSync(pathMod.join(cwd, 'project.yaml')) ||
						fsMod.existsSync(pathMod.join(cwd, 'data/uk/project.md')) ||
						fsMod.existsSync(pathMod.join(cwd, 'data/en/project.md')) ||
						fsMod.existsSync(pathMod.join(cwd, 'releases/1/0/v1.0.0/release.md'))

					if (!hasDescription) {
						currentPhase = '1-seed'
					} else {
						const domainDir = pathMod.join(cwd, 'src/domain')
						let hasModel = false
						let hasTests = false
						if (fsMod.existsSync(domainDir)) {
							try {
								const domainFiles = await fsPromises.readdir(domainDir)
								hasModel = domainFiles.some(
									(f) => f.endsWith('.js') && !f.endsWith('.test.js') && !f.endsWith('.spec.js')
								)
								hasTests = domainFiles.some((f) => f.endsWith('.test.js') || f.endsWith('.spec.js'))
							} catch (e) {}
						}
						if (!hasModel) {
							currentPhase = '2-model'
						} else if (!hasTests) {
							currentPhase = '3-contract'
						} else {
							currentPhase = '4-adapter'
						}
					}
				}
			} catch (e) {
				isScaffoldRequest = true
			}
		}

		if (!pipelineWorkflows && (isNan0Web || isScaffoldRequest)) {
			const activeWfs = [
				'nan0web',
				'architecture',
				'olm-ui-architecture-core',
				'code-style',
				'app-pipeline',
			]
			if (currentPhase === '1-seed') {
				activeWfs.push('init-project', 'pipeline-no1-seed')
			} else if (currentPhase === '2-model') {
				activeWfs.push('pipeline-no2-model')
			} else if (currentPhase === '3-contract') {
				activeWfs.push('pipeline-no3-contract')
			} else if (currentPhase === '4-adapter') {
				activeWfs.push(
					'pipeline-no4-adapter',
					'pipeline-no5-ui-cli',
					'pipeline-no6-ui-chat',
					'pipeline-no7-ui-web',
					'pipeline-no8-ui-mobile',
					'pipeline-no9-qa'
				)
			}

			for (const wf of activeWfs) {
				if (!wfList.includes(wf) && !wfList.includes(`${wf}.md`)) {
					wfList.push(wf)
				}
			}
		}

		if (wfList.length > 0) {
			const loadedWorkflows = []
			for (const wfName of wfList) {
				const normalizedName = wfName.endsWith('.md') ? wfName : `${wfName}.md`
				const content = await this.loadWorkflow(normalizedName, locale)
				if (content) {
					loadedWorkflows.push(`### Workflow: ${normalizedName}\n${content}`)
				}
			}
			if (loadedWorkflows.length > 0) {
				prompt += '\n\n## Specific Workflows\n' + loadedWorkflows.join('\n\n')
			}
		}

		if (isNan0Web || isScaffoldRequest) {
			const archHeader = `

## CRITICAL REQUIREMENT: NAN•WEB SOVEREIGN ARCHITECTURE
You are scaffolding or working in a NaN•Web workspace. You MUST strictly adhere to the OLMUI (One Logic - Many UIs) and Model-as-Schema architectural standards:

### CURRENT DEVELOPMENT PHASE: ${currentPhase.toUpperCase()}
Based on the current files in the directory, you are in Phase: ${currentPhase}.
You MUST focus exclusively on this phase and only create/modify the files allowed for this phase:
- PHASE 1-SEED: You are ONLY allowed to create 'data/_/langs.nan0' and 'releases/1/0/v1.0.0/release.md' (the seed/spec). DO NOT write any domain model files, UI scripts, or tests!
- PHASE 2-MODEL: You are ONLY allowed to write the domain model class under 'src/domain/' extending 'ModelAsApp' (from '@nan0web/ui-cli' or '@nan0web/types'). No tests or UI scripts!
- PHASE 3-CONTRACT: You are ONLY allowed to write unit tests for the domain model under 'src/domain/' or 'releases/1/0/v1.0.0/domain.spec.js'.
- PHASE 4-ADAPTER: You are allowed to write UI adapters or views. Never write ad-hoc CLI/UI scripts with process.exit!

1. Strict Layout Structure:
   - data/ (or play/data/): Source of truth for translations and settings (.yaml files). User messages or keys MUST go to data/uk/_/t.yaml or data/en/_/t.yaml. NEVER hardcode strings!
   - src/domain/: Business logic and Model-as-Schema classes (e.g. src/domain/CalculatorModel.js). Pure JavaScript only! No CLI imports, no process.exit, no DOM/UI, no console output!
   - src/ui/: UI/CLI views (e.g. src/ui/cli/index.js) that instantiate domain models and render results.
2. Model-as-Schema:
   - All domain models must be JavaScript classes defining 'static field = { help, default }' metadata.
3. Late-Bound i18n:
   - Use late-bound i18n function t() for all user outputs.
4. Total UI Blindness:
   - The domain model must have zero awareness of the UI layout.

Ensure all generated files follow this architecture strictly. Do not generate a simple flat Node.js structure unless it matches this directory layout!
`
			prompt = archHeader + prompt
		}

		return prompt
	}

	/**
	 * Load a workflow by name from data/{locale}/workflows/{name}.
	 * @param {string} name Workflow filename (e.g. 'nan0web.md')
	 * @param {string} [locale='uk']
	 * @returns {Promise<string>}
	 */
	async loadWorkflow(name, locale = 'uk') {
		const { db } = /** @type {any} */ (this._)
		if (!db) return ''
		try {
			const registry = await this.getPlatformRegistry()
			const cleanName = name.endsWith('.md') ? name.slice(0, -3) : name
			const absPath = registry.workflows[cleanName] || registry.workflows[name]
			if (absPath) {
				const fs = await import('node:fs/promises')
				const content = await fs.readFile(absPath, 'utf8')
				if (content) return content
			}
		} catch (e) {}

		try {
			const path = `@data/${locale}/workflows/${name}`
			let exists = true
			if (typeof db.stat === 'function') {
				const stat = await db.stat(path)
				exists = !!(stat && stat.exists)
			}
			if (exists) {
				try {
					const content = await db.loadDocumentAs('.txt', path)
					if (typeof content === 'string') return content
				} catch (e) {
					// Fall through to fallback
				}
			}
			// Fallback to 'en'
			const fallbackPath = `@data/en/workflows/${name}`
			let fallbackExists = true
			if (typeof db.stat === 'function') {
				const stat = await db.stat(fallbackPath)
				fallbackExists = !!(stat && stat.exists)
			}
			if (fallbackExists) {
				try {
					const content = await db.loadDocumentAs('.txt', fallbackPath)
					if (typeof content === 'string') return content
				} catch (e) {
					// Ignore
				}
			}
			return ''
		} catch (e) {
			return ''
		}
	}

	/**
	 * Scans the local nan0web platform to locate all workflows and inspectors.
	 * Returns a map of: name -> absolutePath
	 * @returns {Promise<{ workflows: Record<string, string>, inspectors: Record<string, string> }>}
	 */
	async getPlatformRegistry() {
		if (this._platformRegistry) return this._platformRegistry

		const registry = { workflows: {}, inspectors: {} }

		const isTesting =
			typeof globalThis.it === 'function' ||
			process.env.NODE_ENV === 'test' ||
			process.argv.some((arg) => arg.includes('test'))

		if (isTesting) {
			this._platformRegistry = registry
			return registry
		}

		try {
			const fs = await import('node:fs/promises')
			const pathMod = await import('node:path')
			const { existsSync } = await import('node:fs')
			const osMod = await import('node:os')

			// Find the platform path
			let platformPath = null
			const candidates = [this._['workspaceRoot'], process.cwd()]

			for (const cand of candidates) {
				if (cand && existsSync(pathMod.join(cand, 'pnpm-workspace.yaml'))) {
					platformPath = cand
					break
				}
			}

			if (!platformPath) {
				this._platformRegistry = registry
				return registry
			}

			// Read nan0web_store.csv from ~/.nan0web/store/nan0web_store.csv if exists
			const storeCsvPath = pathMod.join(osMod.homedir(), '.nan0web/store/nan0web_store.csv')
			let packages = []

			if (existsSync(storeCsvPath)) {
				try {
					const csvContent = await fs.readFile(storeCsvPath, 'utf8')
					const lines = csvContent.split('\n').filter(Boolean)
					if (lines.length > 1) {
						const headers = lines[0].split(',')
						const pathIdx = headers.indexOf('path')
						const nameIdx = headers.indexOf('name')
						if (pathIdx !== -1) {
							for (let i = 1; i < lines.length; i++) {
								const cols = lines[i].split(',')
								if (cols[pathIdx] && cols[nameIdx]) {
									packages.push({ name: cols[nameIdx], path: cols[pathIdx] })
								}
							}
						}
					}
				} catch (e) {
					// Fallback to directory scan
				}
			}

			// Fallback to directory scan if registry is empty
			if (packages.length === 0) {
				const scanTargets = ['packages', 'apps', '.packages']
				for (const tgt of scanTargets) {
					const tgtPath = pathMod.join(platformPath, tgt)
					if (existsSync(tgtPath)) {
						try {
							const entries = await fs.readdir(tgtPath, { withFileTypes: true })
							for (const entry of entries) {
								if (
									entry.isDirectory() &&
									!entry.name.startsWith('.') &&
									entry.name !== 'node_modules'
								) {
									packages.push({ name: entry.name, path: pathMod.join(tgtPath, entry.name) })
								}
							}
						} catch (e) {}
					}
				}
			}

			// Parse nan0web.nan0 for each package
			for (const pkg of packages) {
				const nan0Path = pathMod.join(pkg.path, 'nan0web.nan0')
				if (existsSync(nan0Path)) {
					try {
						const content = await fs.readFile(nan0Path, 'utf8')
						const lines = content.split('\n')
						let inWorkflows = false
						let inInspectors = false
						for (const line of lines) {
							const trimmed = line.trim()
							if (trimmed.startsWith('workflows:')) {
								inWorkflows = true
								inInspectors = false
							} else if (trimmed.startsWith('inspectors:')) {
								inInspectors = true
								inWorkflows = false
							} else if (trimmed.startsWith('-') && (inWorkflows || inInspectors)) {
								const relPath = trimmed.replace('-', '').replace(/['"]/g, '').trim()
								const name = relPath.split('/').pop() || ''
								const cleanName = name.endsWith('.md') ? name.slice(0, -3) : name
								const absPath = pathMod.join(pkg.path, relPath)
								if (inWorkflows) {
									registry.workflows[cleanName] = absPath
									registry.workflows[name] = absPath
								} else {
									registry.inspectors[cleanName] = absPath
									registry.inspectors[name] = absPath
								}
							} else if (trimmed && !trimmed.startsWith('-')) {
								inWorkflows = false
								inInspectors = false
							}
						}
					} catch (e) {}
				}
			}
		} catch (e) {}

		this._platformRegistry = registry
		return registry
	}

	/**

	/**
	 * Format command output as a single summary line.
	 * @param {string} stdoutText
	 * @returns {string}
	 */
	formatOneLineSummary(stdoutText) {
		const lines = stdoutText.split('\n').map((l) => l.trim())
		let tests = null,
			suites = null,
			pass = null,
			fail = null,
			duration = null
		let hasStats = false
		for (const line of lines) {
			const match = line.match(/^ℹ\s+(tests|suites|pass|fail|duration_ms)\s+(\d+(?:\.\d+)?)/)
			if (match) {
				hasStats = true
				const key = match[1]
				const val = parseFloat(match[2])
				if (key === 'tests') tests = val
				if (key === 'suites') suites = val
				if (key === 'pass') pass = val
				if (key === 'fail') fail = val
				if (key === 'duration_ms') duration = val
			}
		}
		if (hasStats) {
			const parts = []
			if (tests !== null) parts.push(`tests: ${tests}`)
			if (suites !== null) parts.push(`suites: ${suites}`)
			if (pass !== null) parts.push(`pass: ${pass}`)
			if (fail !== null) parts.push(`fail: ${fail}`)
			if (duration !== null) parts.push(`duration: ${duration}ms`)
			return parts.join(', ')
		}
		const clean = stdoutText.trim()
		if (!clean) return 'Empty output'
		const firstLine = clean.split('\n')[0].trim()
		if (firstLine && firstLine.length <= 120) return firstLine
		return clean.substring(0, 120).replace(/\s+/g, ' ') + '...'
	}

	/**
	 * Expand a path or glob pattern into an array of file paths.
	 * Also supports logical database paths like @data/ or @workflows/.
	 * @param {string} relativePath
	 * @returns {Promise<Array<{path: string, isDb: boolean}>>}
	 */
	async resolvePaths(relativePath) {
		if (!relativePath) return []

		// 1. Check if it's a logical database path
		if (relativePath.startsWith('@data/') || relativePath.startsWith('@workflows/')) {
			let dbPath = relativePath
			if (relativePath.startsWith('@workflows/')) {
				dbPath = `@data/uk/workflows/${relativePath.substring(11)}`
			}
			if (!dbPath.includes('*') && !dbPath.includes('?') && !dbPath.includes('{')) {
				return [{ path: dbPath, isDb: true }]
			}
		}

		// 2. Check if it's a glob pattern (contains *, ?, or {)
		if (relativePath.includes('*') || relativePath.includes('?') || relativePath.includes('{')) {
			try {
				const matches = []
				const { db } = /** @type {any} */ (this._)

				let baseDir = '.'
				let pattern = relativePath
				if (relativePath.startsWith('@workflows/')) {
					pattern = `@data/uk/workflows/${relativePath.substring(11)}`
				}

				const firstWildcard = pattern.search(/[\*\?\{]/)
				if (firstWildcard !== -1) {
					const lastSlash = pattern.lastIndexOf('/', firstWildcard)
					if (lastSlash !== -1) {
						baseDir = pattern.substring(0, lastSlash)
					}
				}

				if (db && typeof db.browse === 'function') {
					const mm = (await import('micromatch')).default
					const ignoreList = pattern.startsWith('@')
						? []
						: ['.git', 'node_modules', 'dist', '.datasets', 'chat', 'releases']

					for await (const entry of db.browse(baseDir, { depth: -1, ignore: ignoreList })) {
						const entryPath = entry.uri || entry.path || entry.name
						if (mm.isMatch(entryPath, pattern)) {
							matches.push({ path: entryPath, isDb: pattern.startsWith('@') })
						} else {
							const absPath = path.resolve(db.cwd || '.', entryPath)
							if (mm.isMatch(absPath, pattern)) {
								matches.push({ path: absPath, isDb: pattern.startsWith('@') })
							}
						}
					}
				} else {
					try {
						const mm = (await import('micromatch')).default
						const { readdir } = await import('node:fs/promises')
						const globPattern = relativePath.replace(/\\/g, '/')
						let baseDir = '.'
						const firstWildcard = globPattern.search(/[\*\?\{]/)
						if (firstWildcard !== -1) {
							const lastSlash = globPattern.lastIndexOf('/', firstWildcard)
							if (lastSlash !== -1) {
								baseDir = globPattern.substring(0, lastSlash)
							}
						}

						const walk = async (dir) => {
							const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
							for (const entry of entries) {
								const fullPath = path.join(dir, entry.name).replace(/\\/g, '/')
								if (entry.isDirectory()) {
									if (entry.name !== 'node_modules' && entry.name !== '.git') {
										await walk(fullPath)
									}
								} else {
									if (mm.isMatch(fullPath, globPattern)) {
										matches.push({ path: fullPath, isDb: false })
									}
								}
							}
						}
						await walk(baseDir)
					} catch (e) {}
				}
				return matches
			} catch (e) {
				return []
			}
		}

		// 3. Fallback to standard local path
		return [{ path: relativePath, isDb: false }]
	}

	/**
	 * Resolve user input, loading referenced files and positional arguments.
	 * @param {string} input
	 * @returns {Promise<string>}
	 */
	async packInput(input) {
		const { os, db } = /** @type {any} */ (this._)
		this.injectedFiles.clear()
		let text = input

		// 1. If input is a single file path/glob/logical path, load it if no newlines
		if (input && !input.includes('\n')) {
			const resolved = await this.resolvePaths(input)
			if (resolved.length === 1) {
				const { path, isDb } = resolved[0]
				try {
					if (isDb && db) {
						const content = await db.loadDocumentAs('.txt', path)
						if (typeof content === 'string') {
							text = content
							this.injectedFiles.set(path, Buffer.byteLength(content, 'utf8'))
						}
					} else if (!isDb && (await os.exists(path))) {
						const content = await os.readFile(path)
						text = content
						this.injectedFiles.set(path, Buffer.byteLength(content, 'utf8'))
					}
				} catch (e) {
					// Ignore and fallback
				}
			}
		}

		// 2. Parse checklist lines `- [label](path)` in the text and inject files
		const lines = text.split('\n')
		const outputLines = []
		const injected = new Set()

		for (const line of lines) {
			if (line.startsWith('- [') && line.endsWith(')')) {
				const parts = line.slice(3, -1).split('](')
				if (parts.length === 2) {
					const [label, relativePath] = parts
					if (relativePath) {
						const resolved = await this.resolvePaths(relativePath)
						let handled = false
						for (const { path, isDb } of resolved) {
							if (isDb && db) {
								if (!injected.has(path)) {
									injected.add(path)
									try {
										const content = await db.loadDocumentAs('.txt', path)
										if (typeof content === 'string') {
											this.injectedFiles.set(path, Buffer.byteLength(content, 'utf8'))
											const ext = path.split('.').pop() || 'txt'
											outputLines.push(`#### [${label}](${path})`)
											outputLines.push(`\`\`\`${ext}`)
											outputLines.push(content)
											outputLines.push('```')
											handled = true
										}
									} catch (e) {
										// Ignore
									}
								}
							} else if (!isDb && (await os.exists(path))) {
								if (!injected.has(path)) {
									injected.add(path)
									try {
										const content = await os.readFile(path)
										this.injectedFiles.set(path, Buffer.byteLength(content, 'utf8'))
										const ext = path.split('.').pop() || 'txt'
										const displayLabel = resolved.length > 1 ? path.split('/').pop() || path : label
										outputLines.push(`#### [${displayLabel}](${path})`)
										outputLines.push(`\`\`\`${ext}`)
										outputLines.push(content)
										outputLines.push('```')
										handled = true
									} catch (e) {
										// Ignore
									}
								}
							}
						}
						if (handled) {
							continue
						}
					}
				}
			}
			outputLines.push(line)
		}
		text = outputLines.join('\n')

		// 3. Process additional files from positionals (CLI arguments)
		if (Array.isArray(this._positionals)) {
			for (const file of this._positionals) {
				if (typeof file === 'string') {
					const resolved = await this.resolvePaths(file)
					for (const { path, isDb } of resolved) {
						if (isDb && db) {
							if (!injected.has(path)) {
								injected.add(path)
								try {
									const content = await db.loadDocumentAs('.txt', path)
									if (typeof content === 'string') {
										this.injectedFiles.set(path, Buffer.byteLength(content, 'utf8'))
										const filename = path.split('/').pop() || path
										const ext = path.split('.').pop() || 'txt'
										text += `\n\n#### [${filename}](${path})\n\`\`\`${ext}\n${content}\n\`\`\``
									}
								} catch (e) {
									// Ignore
								}
							}
						} else if (!isDb && (await os.exists(path))) {
							if (!injected.has(path)) {
								injected.add(path)
								try {
									const content = await os.readFile(path)
									this.injectedFiles.set(path, Buffer.byteLength(content, 'utf8'))
									const filename = path.split('/').pop() || path
									const ext = path.split('.').pop() || 'txt'
									text += `\n\n#### [${filename}](${path})\n\`\`\`${ext}\n${content}\n\`\`\``
								} catch (e) {
									// Ignore
								}
							}
						}
					}
				}
			}
		}

		return text
	}

	/**
	 * Main execution loop for the Chat session
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { t, ai, db } = this._

		if (!ai) {
			throw new Error(t(ChatSessionModel.UI.errorNoAi))
		}
		if (!db) {
			throw new Error(t(ChatSessionModel.UI.errorNoDb))
		}
		const chatDb = db.mounts.get('@chat')
		if (!chatDb) {
			throw new Error(t(ChatSessionModel.UI.errorNoChatDb))
		}

		await db.connect()

		const current = (await db.loadDocument('@local/current')) ?? {}
		current.id = this.id || current.id || randomUUID()
		current.date = current.date ? new Date(current.date) : new Date()
		this.id = current.id
		this.date = current.date
		await db.saveDocument('@local/current.nan0', current)
		this._currentDb = db.mounts.get('@current')
		if (!this._currentDb) {
			const currentPath = chatDb.location('')
			this._currentDb = new DBFS({ cwd: currentPath, root: current.id })
		}

		yield show(
			t(ChatSessionModel.UI.welcome, { id: this.id, date: this.date.toLocaleString() }),
			'success'
		)

		/** @type {ChatSessionContext} */
		const ctx = {
			singleShot: !!this.input,
			extraSystemMessages: [],
			agentIterations: 0,
			messages: [],
		}
		/** @type {string | null} Pending response to replay without LLM call */
		let pendingReplayAnswer = null

		// --continue: restore session state
		if (this.continue) {
			const continueId = this.id || current.lastFailed || current.id
			if (!continueId) {
				const error = t(ChatSessionModel.UI.continue_no_session)
				yield show(error, 'error')
				return result({ status: 'error', error })
			}

			this.id = continueId
			this._currentDb = new DBFS({ cwd: chatDb.location(''), root: continueId })
			yield show(t(ChatSessionModel.UI.continue_loading, { id: continueId }), 'info')

			const history = await this.loadSessionHistory(this._currentDb)
			ctx.messages.push(...history)

			let lastResponse = ''
			try {
				if (this._currentDb) {
					lastResponse = await this._currentDb.loadDocumentAs('.txt', 'response.md', '')
				}
			} catch (e) {}

			if (lastResponse) {
				const parsedContinue = StrictBoundaryInterpreter.parse(lastResponse)
				if (parsedContinue.isValid) {
					// Replay: response is valid, re-process files/commands
					yield show(t(ChatSessionModel.UI.continue_replay), 'info')
					pendingReplayAnswer = lastResponse
				} else {
					// Self-healing: response invalid, ask model to reformat
					yield show(t(ChatSessionModel.UI.continue_healing), 'info')
					ctx.messages.push({ role: 'assistant', content: lastResponse })
					this.input = t(ChatSessionModel.UI.llmErrorFormatValidation, {
						error: parsedContinue.error,
					})
				}
			} else {
				// Re-send: no response, re-send last prompt
				yield show(t(ChatSessionModel.UI.continue_resend), 'info')
				try {
					if (this._currentDb) {
						this.input = await this._currentDb.loadDocumentAs('.txt', 'prompt.md', '')
					}
				} catch (e) {}
				// Remove last user message — it will be re-added by the loop
				if (ctx.messages.length > 0 && ctx.messages[ctx.messages.length - 1].role === 'user') {
					ctx.messages.pop()
				}
			}
			ctx.singleShot = false
		}

		while (true) {
			let answer = ''
			let success = false

			if (pendingReplayAnswer) {
				// --continue replay: skip input gathering and LLM call
				answer = pendingReplayAnswer
				success = true
				pendingReplayAnswer = null
			} else {
				const result = yield* this.processInput(ctx)
				if ('string' === typeof result) {
					answer = result
				} else if (false === result) {
					break
				} else if (true === result) {
					continue
				}
			} // end of else (non-replay path)

			// Add assistant response to conversation history
			ctx.messages.push({ role: 'assistant', content: answer })

			// Apply Boundary file updates and commands
			const parsed = StrictBoundaryInterpreter.parse(answer)

			// 1. Process files
			const fileActions = yield* this.processFileChanges(parsed)
			if (false === fileActions) {
				// skip file actions
				this.input = ''
				continue
			}
			let modifiedFiles = []
			if (Array.isArray(fileActions)) {
				modifiedFiles = fileActions
				this.savedFiles = [...(this.savedFiles || []), ...fileActions]
			}
			if (modifiedFiles.length === 0) {
				// no files modified - skipping auto-verify
			}

			// 2. Process commands and workflow requests
			const requestsActions = yield* this.processRequests(parsed, modifiedFiles, ctx)
			if (false === requestsActions) {
				continue
			}
			if (requestsActions && typeof requestsActions === 'object' && requestsActions.type === 'result') {
				return requestsActions
			}

			// 2.5 Auto-verify TDD loop
			if (this.autoVerify && modifiedFiles.length > 0) {
				let maxRetries = this.maxRetries || 3
				let verifySuccess = false

				// Initialize state if needed
				if (this._tddAttempts === undefined || this._tddAttempts === 0) {
					this._tddAttempts = 0
					this._previousFailCount = Infinity
					this._degradationCount = 0
				}

				this._tddAttempts++
				yield show(t(ChatSessionModel.UI.auto_verify_running), 'info')

				const testResult = await this.runShortestPathTests(modifiedFiles)
				await this.logTrace({
					type: 'auto_verify',
					attempt: this._tddAttempts,
					max: maxRetries,
					success: testResult.success,
					failCount: testResult.failCount,
				})

				if (testResult.success) {
					yield show(
						t(ChatSessionModel.UI.auto_verify_passed, {
							attempt: this._tddAttempts,
							max: maxRetries,
						}),
						'success'
					)
					verifySuccess = true
					
					// Reset TDD state upon success
					this._tddAttempts = 0
					this._previousFailCount = Infinity
					this._degradationCount = 0
					this._currentModelIndex = 0
				} else {
					const errors = this.extractErrors(testResult.output)
					const failCount = testResult.failCount || 1

					yield show(
						t(ChatSessionModel.UI.auto_verify_failed, {
							attempt: this._tddAttempts,
							max: maxRetries,
							failCount,
						}),
						'warn'
					)

					const maxDegradations = 2
					let modelSwitched = false

					if (this._previousFailCount !== Infinity) {
						if (failCount < this._previousFailCount) {
							// Progress: Extend max retries
							maxRetries++
							this.maxRetries = maxRetries
							this._degradationCount = 0
							yield show(
								t(ChatSessionModel.UI.auto_verify_progress, {
									prev: this._previousFailCount,
									curr: failCount,
								}),
								'info'
							)
							this._previousFailCount = failCount
						} else {
							// Stagnation or degradation
							this._degradationCount++
							yield show(
								t(ChatSessionModel.UI.auto_verify_degradation, {
									prev: this._previousFailCount,
									curr: failCount,
									degradationCount: this._degradationCount,
									maxDegradations,
								}),
								'warn'
							)

							if (this._degradationCount >= maxDegradations) {
								yield show(
									t(ChatSessionModel.UI.auto_verify_aborted_degradation),
									'error'
								)
								// Reset TDD state to prevent infinite loops and abort
								this._tddAttempts = 0
								this._previousFailCount = Infinity
								this._degradationCount = 0
								this._currentModelIndex = 0
								break
							}

							// Try to switch to the next model in strategic cascade queue
							const strategy = await AiStrategyModel.loadFromDb(db)
							const queue = this.model ? [this.model] : strategy.cascadeQueue
							
							if (this._currentModelIndex + 1 < queue.length && !this.model) {
								this._currentModelIndex++
								const nextModelId = queue[this._currentModelIndex]
								yield show(
									t(ChatSessionModel.UI.auto_verify_switching_model, {
										modelId: nextModelId,
									}),
									'info'
								)
								modelSwitched = true
							}
						}
					} else {
						// First failure recorded
						this._previousFailCount = failCount
					}

					if (this._tddAttempts >= maxRetries && !modelSwitched) {
						yield show(
							t(ChatSessionModel.UI.auto_verify_exhausted, {
								max: maxRetries,
							}),
							'error'
						)
						// Reset TDD state upon exhaustion
						this._tddAttempts = 0
						this._previousFailCount = Infinity
						this._degradationCount = 0
						this._currentModelIndex = 0
						break
					}

					this.input = t(ChatSessionModel.UI.auto_verify_prompt, {
						attempt: this._tddAttempts,
						max: maxRetries,
						errors,
					})
					ctx.singleShot = false
				}

				if (verifySuccess) {
					this.input = ''
					if (ctx.singleShot || this.autoVerify) {
						break
					}
					continue
				} else if (!ctx.singleShot) {
					continue
				}
			}

			// 3. Post-execution verification menu
			if (
				modifiedFiles.length > 0 &&
				!ctx.singleShot &&
				!this.autoVerify &&
				!process.env.NODE_TEST_CONTEXT &&
				process.env.NODE_ENV !== 'test'
			) {
				const verificationActions = [
					new VerificationActionModel(
						{
							key: 'test',
							cmd: 'pnpm test',
							labelKey: 'run_tests_option',
							runningKey: 'executing_test_suite',
							passedKey: 'tests_passed',
							failedKey: 'tests_failed',
						},
						this._
					),
					new VerificationActionModel(
						{
							key: 'lint',
							cmd: 'pnpm run lint || npm run lint',
							labelKey: 'run_lint_option',
							runningKey: 'running_linter',
							passedKey: 'lint_passed',
							failedKey: 'lint_failed',
						},
						this._
					),
					new VerificationActionModel(
						{
							key: 'validate',
							cmd: 'pnpm test:validate || npm run test:validate',
							labelKey: 'run_validate_option',
							runningKey: 'running_validator',
							passedKey: 'validator_passed',
							failedKey: 'validator_failed',
						},
						this._
					),
				]

				while (true) {
					const options = verificationActions.map((action) => ({
						title: t(ChatSessionModel.UI[action.labelKey]),
						value: action.key,
					}))
					options.push({
						title: t(ChatSessionModel.UI.continue_session_option),
						value: 'continue',
					})

					const choice = yield ask('select', {
						help: t(ChatSessionModel.UI.verification_help),
						options,
						default: 'continue',
					})

					if (choice.cancelled || choice.value === 'continue') {
						break
					}

					const action = verificationActions.find((a) => a.key === choice.value)
					if (action) {
						const res = /** @type {any} */ (yield* action.run())
						const finalRes = res && res.type === 'result' ? res.data : res
						if (finalRes && finalRes.status === 'ok' && finalRes.success) {
							break
						}
					}
				}
			}

			// Reset input to prompt again in interactive loop
			this.input = ''

			if (ctx.singleShot) {
				break
			}
		}

		return result({ status: 'ok', id: this.id, savedFiles: this.savedFiles || [] })
	}

	/**
	 * @param {ChatSessionContext} ctx
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, boolean | string, any>} Result FALSE to break the chat loop, TRUE to continue the chat loop, "string" to set the answer to the session
	 */
	async *processInput(ctx) {
		const { db, ai, t } = this._
		if (!db) {
			yield show(t(ChatSessionModel.UI.errorNoDb), 'error')
			return false
		}
		if (!this._currentDb) {
			yield show(t(ChatSessionModel.UI.errorNoChatDb), 'error')
			return false
		}
		// Read user input if empty
		if (!this.input) {
			const res = yield ask('input', ChatSessionModel.input)
			if (res.cancelled || !res.value) {
				return false
			}
			this.input = res.value
			ctx.agentIterations = 0
			// Reset TDD healing parameters on new manual input
			this._tddAttempts = 0
			this._previousFailCount = Infinity
			this._degradationCount = 0
			this._currentModelIndex = 0
		}

		await this.logTrace({ type: 'prompt', content: this.input })

		const promptText = await this.packInput(this.input)

		if (this.injectedFiles.size > 0) {
			let totalBytes = 0
			for (const bytes of this.injectedFiles.values()) {
				totalBytes += bytes
			}
			yield show(
				t(ChatSessionModel.UI.injected_files_summary, {
					count: this.injectedFiles.size,
					bytes: totalBytes,
				}),
				'success'
			)
		}
		const sessionPath = this._currentDb.location('')
		yield show(t(ChatSessionModel.UI.session_logs_saved, { path: sessionPath }), 'info')

		await this._currentDb.saveDocument('prompt.md', promptText)

		if (ctx.messages.length === 0 || ctx.messages[ctx.messages.length - 1].content !== promptText) {
			ctx.messages.push({ role: 'user', content: promptText })
		}

		// Cascade LLMs queue from strategy
		const strategy = await AiStrategyModel.loadFromDb(db)
		let queue = this.model ? [this.model] : strategy.cascadeQueue

		// Shift queue if we switched active model due to degradation in TDD loop
		if (this._currentModelIndex > 0 && !this.model) {
			queue = queue.slice(this._currentModelIndex)
		}

		if (queue.length === 0) {
			const error = t(ChatSessionModel.UI.no_strategic_cascade)
			yield show(error, 'error')
			return false
		}

		let success = false
		let answer = ''

		for (const currentModelId of queue) {
			try {
				let modelInfo = ai.findModel ? ai.findModel(currentModelId) : null
				if (!modelInfo) {
					modelInfo = { id: currentModelId, provider: 'openrouter' }
				}

				const systemPrompt = await this.buildSystemPrompt()
				const messages = [
					{
						role: 'system',
						content:
							systemPrompt ||
							'You are an autonomous AI coding assistant. Respond ONLY in strict boundary format: ---boundary:filename--- contents ---boundary---',
					},
					...ctx.extraSystemMessages,
					...ctx.messages,
				]

				// Check model context limit vs estimated prompt size
				const totalChars = messages.reduce((acc, msg) => acc + (msg.content || '').length, 0)
				const estimatedTokens = Math.ceil(totalChars / 3)
				const contextLimit = modelInfo.context_length || 65000

				if (estimatedTokens > contextLimit) {
					yield show(
						t(ChatSessionModel.UI.skipping_model_context_overflow, {
							modelId: currentModelId,
							estimatedTokens,
							contextLimit,
						}),
						'warn'
					)
					continue
				}

				const promptBytes = messages.reduce(
					(acc, msg) => acc + Buffer.byteLength(msg.content || '', 'utf8'),
					0
				)
				yield show(
					t(ChatSessionModel.UI.prompt_details, {
						bytes: promptBytes,
						tokens: estimatedTokens,
					}),
					'info'
				)

				let estCostText = ''
				if (modelInfo.pricing && typeof modelInfo.pricing.calc === 'function') {
					const estCost = modelInfo.pricing.calc({
						inputTokens: estimatedTokens,
						outputTokens: 0,
					})
					estCostText = ` (est. cost: $${estCost.toFixed(6)})`
				}

				yield show(
					t(ChatSessionModel.UI.trying_model, { modelId: currentModelId }) + estCostText,
					'info'
				)

				await this._currentDb.saveDocument('messages.jsonl', messages)

				const stream = await ai.streamText(modelInfo, messages)
				const start = Date.now()
				let tempAnswer = ''
				yield progress(t(ChatSessionModel.UI.streaming), 0)

				for await (const delta of stream.textStream) {
					tempAnswer += delta
					yield progress(t(ChatSessionModel.UI.streaming), tempAnswer.length)
				}
				yield progress(t(ChatSessionModel.UI.streaming_finished), 0, { stop: true })

				const elapsed = (Date.now() - start) / 1000

				// Save response BEFORE validation (for --continue recovery)
				await this._currentDb.saveFile('response.md', tempAnswer)

				// Parse and validate with StrictBoundaryInterpreter
				const parsed = StrictBoundaryInterpreter.parse(tempAnswer)
				if (!parsed.isValid) {
					throw new Error(`Format validation failed: ${parsed.error}`)
				}

				answer = tempAnswer
				success = true

				// Log metrics
				const rawUsage = (await stream.usage) || { promptTokens: 0, completionTokens: 0 }
				const usage = {
					promptTokens:
						typeof rawUsage.promptTokens === 'number' && !Number.isNaN(rawUsage.promptTokens)
							? rawUsage.promptTokens
							: Math.ceil(JSON.stringify(messages).length / 4),
					completionTokens:
						typeof rawUsage.completionTokens === 'number' &&
						!Number.isNaN(rawUsage.completionTokens)
							? rawUsage.completionTokens
							: Math.ceil(tempAnswer.length / 4),
				}
				const totalTokens = usage.promptTokens + usage.completionTokens
				const speed = elapsed > 0 ? totalTokens / elapsed : 0

				let cost = 0
				if (modelInfo.pricing && typeof modelInfo.pricing.calc === 'function') {
					cost = modelInfo.pricing.calc({
						inputTokens: usage.promptTokens,
						outputTokens: usage.completionTokens,
					})
				}

				await StatsLogger.log({
					modelId: modelInfo.id,
					provider: modelInfo.provider,
					inputTokens: usage.promptTokens,
					outputTokens: usage.completionTokens,
					speed: Number(speed.toFixed(2)),
					taskDuration: Number(elapsed.toFixed(2)),
					cost,
				}, this.statsBaseDir)

				await this.logTrace({
					type: 'llm_call',
					model: modelInfo.id,
					provider: modelInfo.provider,
					usage,
					duration: elapsed,
					cost,
				})

				yield show(
					t(ChatSessionModel.UI.metrics_summary, {
						promptTokens: usage.promptTokens,
						completionTokens: usage.completionTokens,
						duration: elapsed.toFixed(2),
						cost: cost.toFixed(6),
					})
				)

				return answer
			} catch (/** @type {any} */ err) {
				let errMsg = err.message || String(err)
				const statusCode =
					err.statusCode || err.status || err.cause?.statusCode || err.cause?.status
				if (statusCode) errMsg += ` (HTTP ${statusCode})`
				const responseBody = err.responseBody || err.cause?.responseBody
				if (responseBody) errMsg += `\nResponse Body: ${responseBody}`
				if (err.cause) errMsg += `\nCause: ${err.cause.message || String(err.cause)}`

				const msg = errMsg.toLowerCase()
				const isRateLimit =
					statusCode === 429 ||
					msg.includes('429') ||
					msg.includes('too many') ||
					msg.includes('traffic') ||
					msg.includes('limit exceeded') ||
					msg.includes('rate limit')

				const errorDisplay = isRateLimit
					? 'Rate limit exceeded (HTTP 429). Switching to fallback model...'
					: errMsg

				try {
					if (this._currentDb) {
						await this._currentDb.saveDocument('error.log', err.stack || errMsg)
					}
				} catch (e) {}

				yield show(
					t(ChatSessionModel.UI.model_failed, { modelId: currentModelId, error: errorDisplay }),
					'warn'
				)
			}
		}

		if (!success) {
			yield show(t(ChatSessionModel.UI.no_strategic_cascade), 'error')
			// Save lastFailed for --continue
			try {
				const meta = (await db.loadDocument('@local/current')) ?? {}
				meta.lastFailed = this.id
				meta.lastFailedDate = new Date().toISOString()
				await db.saveDocument('@local/current.nan0', meta)
			} catch {
				yield show(t(ChatSessionModel.UI.errorSavingMeta), 'error')
			}
			this.input = ''
			return true
		}

		return answer
	}

	/**
	 * @param {{ files: Attachment[] }} parsed
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, boolean | number | string[], any>}
	 */
	async *processFileChanges(parsed) {
		const { t, os } = this._
		const filesToSave = parsed.files.filter(
			(file) => file.filename && !file.filename.startsWith('@')
		)
		let autoSave = this.autoVerify
		if (filesToSave.length === 0) {
			return 0
		}

		yield show(t(ChatSessionModel.UI.files_to_save), 'success')
		for (const file of filesToSave) {
			yield show(file.filename)
		}
		if (!autoSave) {
			const res = yield ask('confirm', {
				help: t(ChatSessionModel.UI.confirm_save_files),
				hint: 'confirm',
				default: true,
			})
			if (!res || res.cancelled || res.value !== true) {
				yield show(t(ChatSessionModel.UI.file_changes_discarded), 'warn')
				return false
			}
		}

		const db = this._.db
		if (!db) {
			throw new Error('DB is required')
		}
		const modifiedFiles = []
		const filesNotSaved = []
		for (const file of filesToSave) {
			try {
				let finalContent = ''
				if (file.startLine !== undefined && file.lineCount !== undefined) {
					// Inline snippet replacement
					const originalContent = (await os.exists(file.filename))
						? await os.readFile(file.filename)
						: ''
					const key = `${file.filename}:${file.startLine}:${file.lineCount}`
					const updated = applyBoundaries(
						{ [file.filename]: originalContent },
						{ [key]: file.content.trimEnd() }
					)
					finalContent = updated[file.filename]
				} else {
					// Full file replacement or diff-patch fallback
					const originalContent = (await os.exists(file.filename))
						? await os.readFile(file.filename)
						: ''
					finalContent = applyPatch(originalContent, file.content)
				}

				const validation = BoundaryProtocol.validateFileContent(file.filename, finalContent)
				if (!validation.valid) {
					yield show(t(ChatSessionModel.UI.syntax_error, {
						filename: file.filename,
						error: validation.error
					}), 'error')
					filesNotSaved.push(file.filename)
					continue
				}

				await db.saveFile(file.filename, finalContent)

				modifiedFiles.push(file.filename)
				yield show(t(ChatSessionModel.UI.saved_file, { filename: file.filename }), 'success')
				await this.logTrace({
					type: 'file_save',
					path: file.filename,
					bytes: finalContent.length,
				})
			} catch (e) {
				yield show(t(ChatSessionModel.UI.syntax_error, {
					filename: file.filename,
					error: /** @type {any} */ (e).message
				}), 'error')
				filesNotSaved.push(file.filename)
				continue
			}
		}

		if (filesNotSaved.length > 0) {
			yield show(t(ChatSessionModel.UI.files_not_saved, { count: filesNotSaved.length }), 'error')
		}

		if (modifiedFiles.includes('package.json')) {
			yield show('Detected package.json change. Installing dependencies...', 'info')
			const hasPnpm =
				(await os.exists('pnpm-lock.yaml')) ||
				(await os.exists('../../pnpm-lock.yaml')) ||
				(await os.exists('../../../pnpm-lock.yaml'))
			const installCmd = hasPnpm ? 'pnpm install' : 'npm install'
			yield show(`Running: ${installCmd}...`, 'info')
			const installResult = await os.executeCommand(installCmd)
			if (installResult.code === 0) {
				yield show('Dependencies installed successfully.', 'success')
			} else {
				yield show(
					`Dependencies installation failed: ${installResult.stderr || installResult.stdout}`,
					'warn'
				)
			}
		}
		return modifiedFiles
	}

	/**
	 * Process agent commands, workflows, and bash blocks from parsed response.
	 * @param {import('../../utils/StrictBoundaryInterpreter.js').ParseResult} parsed
	 * @param {string[]} modifiedFiles
	 * @param {{ extraSystemMessages: Array<{role: string, content: string}>, agentIterations: number, singleShot: boolean }} ctx
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, boolean | import('@nan0web/ui').ResultIntent, any>}
	 */
	async *processRequests(parsed, modifiedFiles, ctx) {
		const { t, os } = this._
		const whitelist = ['pnpm test', 'npm run dev', 'pnpm build', 'npm test']
		const agentCommandOutputs = []

		for (const file of parsed.files) {
			if (!file.filename || !file.filename.startsWith('@')) continue

			// Dispatch via command registry (@ls, @get, @search, @workflow, etc.)
			const commandAlias = file.filename.slice(1)
			const CommandClass = this.commandsRegistry.get(commandAlias)
			if (CommandClass) {
				const targets = file.content
					.split('\n')
					.map((x) => x.trim())
					.filter(Boolean)
					.join(', ')
				yield show(
					t(ChatSessionModel.UI.executing_command, { command: `${file.filename} ${targets}` }),
					'info'
				)
				const cmd = new CommandClass(this, file)
				const cmdResult = yield* cmd.run()
				if (commandAlias === 'workflow') {
					// WorkflowCommand returns array of system messages
					if (Array.isArray(cmdResult.data)) {
						ctx.extraSystemMessages.push(...cmdResult.data)
					}
				} else {
					agentCommandOutputs.push(cmdResult.data)
					yield show(
						t(ChatSessionModel.UI.command_succeeded, {
							output: `${file.filename} ${targets}`,
						}),
						'success'
					)
				}
				continue
			}

			// Handle shell commands — strictly from @bash block
			if (file.filename === '@bash') {
				const cmdLines = file.content
					.split('\n')
					.map((l) => l.trim())
					.filter(Boolean)
				for (const cmdText of cmdLines) {
					const isWhitelisted = whitelist.includes(cmdText)
					let shouldExecute = isWhitelisted

					if (!shouldExecute) {
						const res = yield ask('confirm', {
							help: t(ChatSessionModel.UI.confirm_execute_command, { command: cmdText }),
							type: 'boolean',
							hint: 'confirm',
							default: false,
						})
						if (res && !res.cancelled && res.value === true) {
							shouldExecute = true
						}
					}

					if (shouldExecute) {
						yield show(t(ChatSessionModel.UI.executing_command, { command: cmdText }), 'info')
						const out = await os.executeCommand(cmdText)
						await this.logTrace({
							type: 'command',
							cmd: cmdText,
							code: out.code,
							output: out.stdout || out.stderr,
						})
						if (out.code === 0) {
							yield show(
								t(ChatSessionModel.UI.command_succeeded, { output: out.stdout }),
								'success'
							)
						} else {
							yield show(
								t(ChatSessionModel.UI.command_failed, {
									code: out.code,
									output: out.stderr || out.stdout,
								}),
								'error'
							)
						}
					} else {
						yield show(t(ChatSessionModel.UI.skipped_command, { command: cmdText }), 'warn')
					}
				}
			}
		}

		if (agentCommandOutputs.length > 0) {
			ctx.agentIterations++
			if (ctx.agentIterations > 5) {
				yield show(
					'Max agent command iterations reached. Terminating loop to prevent resource waste.',
					'error'
				)
				return result({ ok: false, error: 'max_agent_iterations_exceeded' })
			}
			this.input = agentCommandOutputs.join('\n---\n')
			ctx.singleShot = false
			yield show('Agent commands output collected. Sending back to dialog loop.', 'info')
			return false
		}
		return true
	}

	/**
	 * Simple diff patch applicator.
	 * Supports basic unified diff format or custom +/- line changes.
	 * @param {string} original
	 * @param {string} patchText
	 * @returns {string}
	 */
	static applyPatch(original, patchText) {
		const originalLines = original.split(/\r?\n/)
		const patchLines = patchText.split(/\r?\n/)

		const hasDiffLines = patchLines.some((line) => line.startsWith('+') || line.startsWith('-'))
		if (!hasDiffLines) {
			return patchText
		}

		const resultLines = []
		let origIdx = 0
		let patchIdx = 0

		while (patchIdx < patchLines.length) {
			const patchLine = patchLines[patchIdx]

			if (patchLine.startsWith('@@')) {
				patchIdx++
				continue
			}

			if (patchLine.startsWith('-')) {
				const toRemove = patchLine.slice(1)
				if (
					originalLines[origIdx] !== undefined &&
					originalLines[origIdx].trim() === toRemove.trim()
				) {
					origIdx++
				}
				patchIdx++
			} else if (patchLine.startsWith('+')) {
				resultLines.push(patchLine.slice(1))
				patchIdx++
			} else {
				let content = patchLine
				if (patchLine.startsWith(' ')) {
					content = patchLine.slice(1)
				}
				if (
					originalLines[origIdx] !== undefined &&
					originalLines[origIdx].trim() === content.trim()
				) {
					resultLines.push(originalLines[origIdx])
					origIdx++
				} else {
					resultLines.push(content)
				}
				patchIdx++
			}
		}

		while (origIdx < originalLines.length) {
			resultLines.push(originalLines[origIdx])
			origIdx++
		}

		return resultLines.join('\n')
	}

	/**
	 * Run the shortest path test suite sequentially.
	 * @param {string[]} modifiedFiles
	 * @returns {Promise<{ success: boolean, output: string, failCount: number }>}
	 */
	async runShortestPathTests(modifiedFiles) {
		const runner = await this.detectTestRunner()

		// 1. Zmineni testy
		const testFiles = await this.getCorrespondingTestFiles(modifiedFiles)
		const runedTests = new Set()

		if (testFiles.length > 0) {
			for (const file of testFiles) {
				runedTests.add(file)
				const out = await this.runTestFile(runner, file)
				if (out.code !== 0) {
					const output = out.stderr || out.stdout || ''
					return { success: false, output, failCount: this.countFailures(output) }
				}
			}
		}

		// 2. Prykripleni testy
		const attachedTestFiles = await this.getCorrespondingTestFiles(this._positionals || [])
		for (const file of attachedTestFiles) {
			if (runedTests.has(file)) continue
			runedTests.add(file)
			const out = await this.runTestFile(runner, file)
			if (out.code !== 0) {
				const output = out.stderr || out.stdout || ''
				return { success: false, output, failCount: this.countFailures(output) }
			}
		}

		// 3. Build check (tsc)
		const db = this._.db
		let hasBuildScript = false
		if (db) {
			try {
				const pkgContent = await db.loadDocument('package.json')
				const pkg = JSON.parse(pkgContent)
				if (pkg.scripts && pkg.scripts.build) {
					hasBuildScript = true
				}
			} catch (e) {}
		}

		if (hasBuildScript) {
			const buildOut = await this._.os.executeCommand('pnpm run build || npm run build')
			if (buildOut.code !== 0) {
				return {
					success: false,
					output: buildOut.stderr || buildOut.stdout || '',
					failCount: 1,
				}
			}
		}

		// 4. All tests check (pnpm test / npm test)
		const testOut = await this._.os.executeCommand('pnpm test || npm test')
		if (testOut.code !== 0) {
			const output = testOut.stderr || testOut.stdout || ''
			return { success: false, output, failCount: this.countFailures(output) }
		}

		return { success: true, output: '', failCount: 0 }
	}

	/**
	 * Get corresponding test files for a list of modified files.
	 * @param {string[]} files
	 * @returns {Promise<string[]>}
	 */
	async getCorrespondingTestFiles(files) {
		const db = this._.db
		if (!db) return []

		const testFiles = new Set()
		for (const file of files) {
			if (
				file.endsWith('.test.js') ||
				file.endsWith('.spec.js') ||
				file.includes('/test/') ||
				file.includes('/tests/')
			) {
				testFiles.add(file)
				continue
			}

			if (file.endsWith('.js')) {
				const candidates = [file.replace(/\.js$/, '.test.js'), file.replace(/\.js$/, '.spec.js')]
				for (const cand of candidates) {
					const stat = await db.statDocument(cand).catch(() => null)
					if (stat && stat.exists && stat.isFile) {
						testFiles.add(cand)
					}
				}
			} else if (file.endsWith('.py')) {
				const dir = path.dirname(file)
				const base = path.basename(file)
				const candidates = [path.join(dir, `test_${base}`), file.replace(/\.py$/, '_test.py')]
				for (const cand of candidates) {
					const stat = await db.statDocument(cand).catch(() => null)
					if (stat && stat.exists && stat.isFile) {
						testFiles.add(cand)
					}
				}
			}
		}
		return Array.from(testFiles)
	}

	/**
	 * Detect the test runner for JS project.
	 * @returns {Promise<string>} 'vitest', 'jest', or 'node'
	 */
	async detectTestRunner() {
		const db = this._.db
		if (!db) return 'node'

		try {
			const pkgContent = await db.loadDocument('package.json')
			const pkg = typeof pkgContent === 'string' ? JSON.parse(pkgContent) : pkgContent
			const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
			if (deps.vitest) return 'vitest'
			if (deps.jest) return 'jest'
		} catch (e) {}

		return 'node'
	}

	/**
	 * Run a specific test file using the appropriate runner.
	 * @param {string} runner
	 * @param {string} file
	 * @returns {Promise<any>}
	 */
	async runTestFile(runner, file) {
		let cmd = ''
		let timeout = 3000
		if (runner === 'pytest') {
			cmd = `pytest ${file}`
		} else if (runner === 'vitest') {
			timeout = 30000
			cmd = `npx vitest run --test-timeout=${timeout} ${file}`
		} else if (runner === 'jest') {
			timeout = 9000
			cmd = `npx jest --testTimeout=${timeout} ${file}`
		} else {
			cmd = `node --test --test-timeout=${timeout} ${file}`
		}
		return await this._.os.executeCommand(cmd, { timeout })
	}

	/**
	 * Count test failures from output.
	 * @param {string} output
	 * @returns {number}
	 */
	countFailures(output) {
		const text = String(output)
		if (text.includes('TAP version')) {
			try {
				const parser = new TapParser()
				const root = parser.decode(text)
				return root.failCount || 0
			} catch (e) {}
		}

		let count = 0
		const lines = text.split('\n')
		for (const line of lines) {
			const l = line.toLowerCase()
			if (
				l.includes('fail ') ||
				l.includes('fail:') ||
				l.includes('not ok ') ||
				l.includes('error:') ||
				l.startsWith('✖')
			) {
				count++
			}
		}
		return count || 1
	}

	/**
	 * Extract errors from test runner output.
	 * @param {string} output
	 * @returns {string}
	 */
	extractErrors(output) {
		const text = String(output)
		if (text.includes('TAP version')) {
			try {
				let tab = '\t'
				const spaceMatch = text.match(/^[ \t]+/m)
				if (spaceMatch) {
					tab = spaceMatch[0]
				}
				const parser = new TapParser({ tab })
				const root = parser.decode(text)
				const failedNodes = root.flat().filter((node) => node.isFail)
				if (failedNodes.length > 0) {
					return failedNodes
						.map((node) =>
							parser.encode(node, { indent: 0, parent: /** @type {any} */ ({}) }).trim()
						)
						.join('\n')
				}
			} catch (e) {}
		}

		// Heuristic extractor for Vitest, Jest, Pytest
		const lines = text.split('\n')
		const extracted = []
		let inErrorBlock = false

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i]
			const trimmed = line.trim()
			const isStart =
				trimmed.startsWith('FAIL') ||
				trimmed.includes('Error:') ||
				trimmed.includes('Exception:') ||
				trimmed.startsWith('not ok') ||
				trimmed.startsWith('✖')

			if (isStart) {
				inErrorBlock = true
			}

			if (inErrorBlock) {
				extracted.push(line)
				if (trimmed === '') {
					const nextLine = lines[i + 1]
					if (nextLine !== undefined && !this.isStackTraceOrErrorLine(nextLine)) {
						inErrorBlock = false
					}
				}
			}
		}

		if (extracted.length > 0) {
			return extracted.join('\n')
		}

		return lines.slice(-30).join('\n')
	}

	/**
	 * Check if a line is part of a stack trace or error.
	 * @param {string} line
	 * @returns {boolean}
	 */
	isStackTraceOrErrorLine(line) {
		const trimmed = line.trim()
		return (
			trimmed.startsWith('at ') ||
			trimmed.includes('Error:') ||
			trimmed.includes('Exception:') ||
			trimmed.startsWith('✖') ||
			trimmed.startsWith('FAIL') ||
			/\w+\.\w+:\d+:\d+/.test(trimmed)
		)
	}

	/**
	 * Load conversation history from a session's messages.jsonl.
	 * @param {any} sessionDb DBFS instance for the session directory
	 * @returns {Promise<Array<{role: string, content: string}>>}
	 */
	async loadSessionHistory(sessionDb) {
		const messages = []
		try {
			const raw = await sessionDb.loadDocument('messages.jsonl')
			if (Array.isArray(raw)) {
				for (const msg of raw) {
					if (msg && msg.role && msg.content) {
						messages.push({ role: msg.role, content: msg.content })
					}
				}
			}
		} catch (e) {
			// No history found — start fresh
		}
		// Strip the system message (first entry) — it will be rebuilt by buildSystemPrompt
		if (messages.length > 0 && messages[0].role === 'system') {
			messages.shift()
		}
		return messages
	}

	/**
	 * Log a trace event to session_trace.jsonl.
	 * @param {any} event
	 * @returns {Promise<void>}
	 */
	async logTrace(event) {
		if (!this._currentDb) return
		const line = JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n'
		try {
			await this._currentDb.writeDocument('session_trace.jsonl', line)
		} catch (e) {
			// Best effort, ignore errors
		}
	}
}

/**
 * Simple diff patch applicator.
 * @param {string} original
 * @param {string} patchText
 * @returns {string}
 */
export function applyPatch(original, patchText) {
	return ChatSessionModel.applyPatch(original, patchText)
}

/**
 * VerificationActionModel representing verification actions (test, lint, validate).
 */
export class VerificationActionModel extends ModelAsApp {
	/**
	 * @param {Record<string, any>} data
	 * @param {any} options
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		this.key = data.key
		this.cmd = data.cmd
		this.labelKey = data.labelKey
		this.runningKey = data.runningKey
		this.passedKey = data.passedKey
		this.failedKey = data.failedKey
	}

	async *run() {
		const { os, t } = /** @type {any} */ (this._)
		yield show(t(ChatSessionModel.UI[this.runningKey]), 'info')
		const out = await os.executeCommand(this.cmd)
		const summary = this.formatOneLineSummary(out.stdout || out.stderr || '')
		if (out.code === 0) {
			yield show(t(ChatSessionModel.UI[this.passedKey], { output: summary }), 'success')
			return result({ status: 'ok', success: true })
		} else {
			yield show(t(ChatSessionModel.UI[this.failedKey], { output: summary }), 'error')
			return result({ status: 'error', success: false })
		}
	}

	/**
	 * Formats a multi-line test runner output into a single line summary.
	 * @param {string} text
	 * @returns {string}
	 */
	formatOneLineSummary(text) {
		const lines = text
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)
		const statsPattern =
			/(?:tests\s+\d+|pass\s+\d+|fail\s+\d+|failed\s+\d+|duration_ms\s+\d+|testsPassed|testsFailed|errors)/i
		const match = lines.find((l) => statsPattern.test(l))
		if (match) return match
		return lines[0] || 'Unknown output'
	}
}
