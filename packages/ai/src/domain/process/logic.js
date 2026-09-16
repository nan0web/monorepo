import { show, ask, result, ModelAsApp } from '@nan0web/ui'
import { ChatSession } from '../ChatSession.js'

/**
 * @typedef {Object} TestedFile
 * @property {boolean} ok
 * @property {string[]} [errors]
 */

/**
 * @typedef {Object} LLMRunner
 * @property {(file: string) => Promise<TestedFile>} [checkFile] Node.js syntax checker
 * @property {(file: string) => Promise<TestedFile>} [prettyFile] Prettier/code style checker
 * @property {(file: string) => Promise<TestedFile>} [testFile] Unit/Story test runner
 * @property {(file: string) => Promise<TestedFile>} [buildFile] Type/bundler build runner
 * @property {(chat: ChatSession) => Promise<TestedFile>} [testProject] Full project test runner
 */

/**
 * @typedef {Object} LLMInspector
 * @property {(chat: ChatSession) => Promise<TestedFile>} [inspectProject] Project architectural inspector
 */

/**
 * @typedef {Object} LLMAgentOptions
 * @property {LLMRunner} [runner] Execution runner adapter for processes
 * @property {LLMInspector} [inspector] Inspector runner adapter for architecture inspection
 */

export class LLMAgent extends ModelAsApp {
	static UI = {
		starting: 'Starting LLM Agent...',
		preflightFailed: 'Pre-flight check failed. Base repository has broken tests or syntax.',
		hasErrors: 'Errors were found. We can try to fix them or stop.',
		hasErrorsNoContinue: 'Errors were found. Stop.',
	}

	static autoContinue = {
		options: ['Yes', 'No'],
		value: 'Yes',
		help: 'Continue automatically on errors',
	}
	static skipProjectTests = {
		help: 'Skip full project tests',
		value: false,
	}
	static skipPreflight = {
		help: 'Skip pre-flight baseline check before chat',
		value: false,
	}

	/**
	 * @param {Partial<LLMAgent>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions & LLMAgentOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Continue automatically after errors (Yes/No) */ this.autoContinue
		/** @type {boolean} Skip full project tests */ this.skipProjectTests
		/** @type {boolean} Skip pre-flight baseline check before chat */ this.skipPreflight
		/** @type {LLMRunner | null} */ this.runner = options.runner || null
		/** @type {LLMInspector | null} */ this.inspector = options.inspector || null
	}

	createChat(input = {}) {
		return new ChatSession(input)
	}

	async *readTask(chat) {}

	async *collectContext(chat) {}

	/**
	 * Node.js syntax check (node --check <file>)
	 * @param {string} file
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
	 */
	async *checkFile(file) {
		if (!file.endsWith('.js') && !file.endsWith('.mjs')) {
			return { ok: true, errors: [] }
		}
		if (this.runner?.checkFile) {
			return await this.runner.checkFile(file)
		}
		return { ok: true, errors: [] }
	}

	/**
	 * Formats and validates code hygiene (*.{js|md|yaml|yml|json|jsonl})
	 * @param {string} file
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
	 */
	async *prettyFile(file) {
		const supportedExt = /\.(js|mjs|cjs|ts|md|yaml|yml|json|jsonl)$/
		if (!supportedExt.test(file)) {
			return { ok: true, errors: [] }
		}
		if (this.runner?.prettyFile) {
			return await this.runner.prettyFile(file)
		}
		return { ok: true, errors: [] }
	}

	/**
	 * Tests *.test.js or *.story.js file only, otherwise returns { ok: true }
	 * @param {string} file
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
	 */
	async *testFile(file) {
		if (!file.endsWith('.test.js') && !file.endsWith('.story.js')) {
			return { ok: true, errors: [] }
		}
		if (this.runner?.testFile) {
			return await this.runner.testFile(file)
		}
		return { ok: true, errors: [] }
	}

	/**
	 * Builds / type checks *.js file, otherwise returns { ok: true }
	 * @param {string} file
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
	 */
	async *buildFile(file) {
		if (!file.endsWith('.js') && !file.endsWith('.ts')) {
			return { ok: true, errors: [] }
		}
		if (this.runner?.buildFile) {
			return await this.runner.buildFile(file)
		}
		return { ok: true, errors: [] }
	}

	/**
	 * Tests all test files registered in the context.
	 * @param {ChatSession} chat
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
	 */
	async *testContext(chat) {
		const errors = []
		for (const file of chat.context.files) {
			const tested = yield* this.testFile(file)
			if (!tested.ok && tested.errors?.length) {
				errors.push(...tested.errors)
			}
		}
		return { ok: errors.length === 0, errors }
	}

	/**
	 * Runs full project tests suite if not skipped.
	 * Only invoked when all previous unit and context gates passed.
	 * @param {ChatSession} chat
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
	 */
	async *testProject(chat) {
		if (this.skipProjectTests) {
			return { ok: true, errors: [] }
		}
		if (this.runner?.testProject) {
			return await this.runner.testProject(chat)
		}
		return { ok: true, errors: [] }
	}

	/**
	 * Runs project architectural inspection via @nan0web/inspect.
	 * Only invoked when tests are 100% green.
	 * @param {ChatSession} chat
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
	 */
	async *inspectProject(chat) {
		if (this.inspector?.inspectProject) {
			return await this.inspector.inspectProject(chat)
		}
		return { ok: true, errors: [] }
	}

	/**
	 * Queries LLM with task and error context to generate or modify files.
	 * @param {ChatSession} chat
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { files: string[], chat: ChatSession }, any>}
	 */
	async *processChat(chat) {
		return { files: [], chat }
	}

	/** @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>} */
	async *run() {
		const { t } = this._
		yield show(t(LLMAgent.UI.starting))

		const chat = this.createChat()
		yield* this.readTask(chat)
		yield* this.collectContext(chat)

		// Pre-flight baseline: ensure initial environment is clean before changing code
		if (!this.skipPreflight) {
			const initialContext = yield* this.testContext(chat)
			if (!initialContext.ok) {
				chat.addError(initialContext.errors)
				yield show(t(LLMAgent.UI.preflightFailed), 'error')
				return result({ ok: false, errors: chat.errors })
			}
			const initialProject = yield* this.testProject(chat)
			if (!initialProject.ok) {
				chat.addError(initialProject.errors)
				yield show(t(LLMAgent.UI.preflightFailed), 'error')
				return result({ ok: false, errors: chat.errors })
			}
		}

		let canContinue = true
		do {
			chat.resetErrors()
			const { files } = yield* this.processChat(chat)

			// Automatically register and update touched files in active context
			for (const file of files) {
				chat.touchFile(file)
			}

			// Step 1: Fast per-file gates (syntax, style, unit-test, build)
			for (const file of files) {
				const checked = yield* this.checkFile(file)
				if (!checked.ok) {
					chat.addError(checked.errors)
					continue
				}

				const prettied = yield* this.prettyFile(file)
				if (!prettied.ok) {
					chat.addError(prettied.errors)
					continue
				}

				const tested = yield* this.testFile(file)
				if (!tested.ok) {
					chat.addError(tested.errors)
					continue
				}

				const built = yield* this.buildFile(file)
				if (!built.ok) {
					chat.addError(built.errors)
					continue
				}
			}

			// Step 2: Context integration gate (only if per-file gates passed)
			if (!chat.hasErrors()) {
				const testedContext = yield* this.testContext(chat)
				if (!testedContext.ok) {
					chat.addError(testedContext.errors)
				}
			}

			// Step 3: Full project test gate (only if context gate passed)
			if (!chat.hasErrors()) {
				const testedProject = yield* this.testProject(chat)
				if (!testedProject.ok) {
					chat.addError(testedProject.errors)
				}
			}

			// Step 4: Architectural inspection gate (only if all tests passed)
			if (!chat.hasErrors()) {
				const inspected = yield* this.inspectProject(chat)
				if (!inspected.ok) {
					chat.addError(inspected.errors)
				}
			}

			let canContinue = chat.canContinue()
			if (chat.hasErrors()) {
				chat.nextRetry()
				if (!canContinue) {
					const answer = yield ask('autoContinue', LLMAgent.autoContinue)
					canContinue = answer === 'Yes' || answer === true
				}

				if (canContinue) {
					yield show(t(LLMAgent.UI.hasErrors), 'warn')
				} else {
					yield show(t(LLMAgent.UI.hasErrorsNoContinue), 'warn')
				}
			}
		} while (chat.hasErrors() && canContinue)

		return result({ ok: !chat.hasErrors(), errors: chat.errors })
	}
}
