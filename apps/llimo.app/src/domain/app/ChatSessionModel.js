import { randomUUID } from 'node:crypto'
import yaml from 'yaml'

import { show, ask, progress, result } from '@nan0web/ui'

import { AiModelAsApp } from './AiModelAsApp.js'

/**
 * Contract for the injected AI Engine
 * @typedef {Object} AIEngineContract
 * @property {import('../../llm/ModelInfo.js').ModelInfo | null} selectedModel The currently selected AI model
 * @property {function(string): import('../../llm/ModelInfo.js').ModelInfo | undefined} getModel Get a model by ID
 * @property {function(string): import('../../llm/ModelInfo.js').ModelInfo | undefined} findModel Find a model by partial ID
 * @property {function(string, any[], any=): import('ai').StreamTextResult<any>} streamText Stream text from AI
 */

/**
 * Model-as-Schema for tracking metadata of an active LLiMo Engine execution or chat
 */
export class ChatSessionModel extends AiModelAsApp {
	static alias = 'chat'
	static UI = {
		errorApi: 'API Error: {message}',
		errorNoAi: 'AI engine not injected',
		errorNoDb: 'DB not injected',
		errorModel: 'Model {model} not found',
		welcome: '🎼 LLiMo Chat Session: {$id} ({$date})',
		thinking: 'Thinking...',
		streaming: 'Receiving stream...',
		processing: 'Processing artifacts, files and tests...',
		packed: 'Packed {files} into context',
		unpacked: 'Unpacked {files} into context',
		tests: 'Running tests...',
		testOk: 'Tests passed',
		testFailed: 'Tests failed',
		moreLines: '… and {count} more line(s)',
		next: 'Next step',
		done: 'Done',
	}

	static id = {
		help: 'Unique identifier for the chat session',
		default: null,
		type: 'string',
	}

	static date = {
		help: 'Date string formatted as YYYY-MM-DD for grouping logs',
		default: null,
		type: 'string',
	}

	static input = {
		help: 'Initial input prompt or path to file',
		default: '',
		type: 'text',
		positional: true,
	}

	static model = {
		help: 'AI model to use for the session',
		default: '',
		type: 'string',
	}

	static logsPath = {
		help: 'Absolute path to the directory hosting the chat artifacts (.csv, .log, .md)',
		default: '',
		type: 'string',
	}

	static status = {
		help: 'Current status of the execution: active, ok, failed',
		default: 'active',
		type: 'string',
		error: 'Invalid session status',
		validate: (val) =>
			['active', 'ok', 'failed'].includes(val) ? true : ChatSessionModel.status.error,
	}

	static communication = {
		help: 'Communication format: boundary | markdown',
		default: 'boundary',
		error: 'Invalid communication format',
		validate: (val) =>
			['boundary', 'markdown'].includes(val) ? true : ChatSessionModel.communication.error,
	}

	/**
	 * @param {Partial<ChatSessionModel> | Record<string, any>} [data]
	 * @param {Partial<import('./AiModelAsApp.js').AiModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		if (!data.id) data.id = randomUUID()
		if (!data.date) {
			const today = new Date()
			const yyyy = today.getFullYear()
			const mm = String(today.getMonth() + 1).padStart(2, '0')
			const dd = String(today.getDate()).padStart(2, '0')
			data.date = `${yyyy}-${mm}-${dd}`
		}
		super(data, options)
		/** @type {string} Unique identifier for the chat session */ this.id
		/** @type {string} Date string formatted as YYYY-MM-DD for grouping logs */ this.date
		/** @type {string} Initial input prompt or path to file */ this.input
		/** @type {string} AI model to use for the session */ this.model
		/** @type {string} Absolute path to the directory hosting the chat artifacts (.csv, .log, .md) */ this
			.logsPath
		/** @type {'active' | 'ok' | 'failed'} Current status of the execution */ this.status
		/** @type {'boundary' | 'markdown'} Communication format */ this.communication
	}

	/**
	 * Generate and inject the system prompt on first chat creation.
	 * Loads the base template, local system.md/agent.md overrides, packs
	 * referenced files, and persists the result as a system message.
	 *
	 * @param {import('@nan0web/ai').ChatSession} chat
	 * @param {import('../../utils/FileSystem.js').FileSystem} fs
	 * @param {string} cwd
	 */
	static async initSystemPrompt(chat, fs, cwd) {
		const { generateSystemPrompt, parseSystemPrompt, mergeSystemPrompts } =
			await import('../../llm/system.js')
		const { packMarkdown } = await import('../../llm/pack.js')

		const arr = []
		const base = await generateSystemPrompt()
		arr.push(parseSystemPrompt(base))

		for (const sysFile of ['system.md', 'agent.md']) {
			if (await fs.exists(sysFile)) {
				const content = await fs.readFile(fs.path.resolve(sysFile), 'utf-8')
				arr.push(parseSystemPrompt(content))
			}
		}

		const system = mergeSystemPrompts(arr)
		const packed = await packMarkdown({
			input: system.body,
			cwd,
			ignore: system.vars?.ignore ?? undefined,
		})
		const systemContent = system.head + packed.text
		chat.add({ role: 'system', content: systemContent })
		await chat.save()
		await chat.saveArtifact('system.md', systemContent)
	}

	/**
	 * Generate system prompt from files in this.
	 * @return {Promise<string>}
	 */
	async generateSystemPrompt() {
		if (!this._.db) {
			return ''
		}
		const locale = 'uk'
		// 1. use FileSystem to read files:
		//    - @app/system.md
		//    - @app/agent.md
		//    - @data/${locale}/commands/*.md
		const arr = []
		arr.push(await this._.db.loadDocument(`@app/data/${locale}/system.md`))
		for (const sysFile of ['system.md', 'agent.md']) {
			if ((await this._.db.stat(sysFile))?.exists) {
				const content = await this._.db.loadDocument(sysFile)
				arr.push(content)
			}
		}
		// 2. merge them
		const vars = {}
		let content = ''
		for (const md of arr) {
			if ('string' === typeof md) {
				content += md + '\n\n'
			} else {
				Object.assign(vars, md.vars ?? {})
				content += md.content + '\n\n'
			}
		}
		if (Object.keys(vars).length) {
			content = '---\n' + yaml.stringify(vars) + '\n---\n' + content
		}

		const { default: commands } = await import('../../llm/commands/index.js')
		const { FileSystem } = await import('../../utils/FileSystem.js')
		const { loadConfig, resolveAlias } = await import('../../llm/pack.js')

		const list = Array.from(commands.keys()).join(', ')
		const mdList = Array.from(commands.values()).map(
			Command => `### ${Command.name}\n${Command.description || Command.help}\n\n`
				+ `Example:\n#### [${Command.label || ''}](@${Command.name})\n${Command.example}`
		).join('\n\n')

		let workflowsIndex = ''
		try {
			const fs = new FileSystem()
			const config = await loadConfig(fs)
			if (config.aliases['@workflow']) {
				const workflowDir = resolveAlias('@workflow', config.aliases)
				const entries = await fs.browse(workflowDir)
				const mdFiles = entries.filter(e => e.endsWith('.md'))
				workflowsIndex = mdFiles.map(f => `- ${f}`).join('\n')
			}
		} catch (e) {
			// optional: ignore if aliases fail resolving
		}

		return content
			.replaceAll('<!--TOOLS_LIST-->', list)
			.replaceAll('<!--TOOLS_MD-->', mdList)
			.replaceAll('<!--WORKFLOWS_INDEX-->', workflowsIndex)
			.trim()
	}

	/**
	 * Resolve user input into a packed prompt string.
	 * If the input points to an existing file, reads it and packs
	 * any referenced file links into the prompt context.
	 *
	 * @param {string} input
	 * @param {import('@nan0web/db').DB} db
	 * @returns {Promise<{ promptText: string, packedCount: number }>}
	 */
	static async packInput(input, db) {
		const file = '@app/' + input
		const exists = (await db.stat(file))?.exists
		if (input && !input.includes('\n') && exists) {
			const fileContent = await db.loadDocumentAs('.txt', file, '')
			const { packMarkdown } = await import('../../llm/pack.js')
			const { text, injected } = await packMarkdown({ input: fileContent, cwd: db.cwd })
			return { promptText: text, packedCount: injected.length }
		}
		return { promptText: input, packedCount: 0 }
	}

	/**
	 * Find a model by its full or partial ID.
	 *
	 * @param {AIEngineContract} ai
	 * @param {string} modelId
	 * @returns {import('../../llm/ModelInfo.js').ModelInfo | undefined}
	 */
	static resolveModel(ai, modelId) {
		let model = ai.findModel(modelId)
		if (!model) {
			const models = ai.getModel(modelId)
			if (Array.isArray(models) && models.length > 0) model = models[0]
		}
		return model
	}

	/**
	 * Parse the assistant answer, apply snippet edits, unpack full files,
	 * and run the project test suite.
	 *
	 * @param {string} answer
	 * @param {import('../../utils/FileSystem.js').FileSystem} fs
	 * @param {string} cwd
	 * @returns {Promise<{ unpackedFiles: string[], testResult: { code: number, stdout: string, stderr: string } | null }>}
	 */
	static async unpackAndTest(answer, fs, cwd) {
		const { FileProtocol } = await import('../../FileProtocol.js')
		const parsed = await FileProtocol.parseAdaptive(answer)

		if (!parsed?.correct?.length) {
			return { unpackedFiles: [], testResult: null }
		}

		// Pre-apply snippet edits (boundary with startLine:lineCount)
		for (const file of parsed.correct) {
			if (
				file.filename &&
				!file.filename.startsWith('@') &&
				file.startLine !== undefined &&
				file.lineCount !== undefined
			) {
				const filePath = file.filename
				const originalContent = (await fs.exists(filePath))
					? await fs.readFile(fs.path.resolve(filePath), 'utf-8')
					: ''
				const key = `${filePath}:${file.startLine}:${file.lineCount}`
				const { applyBoundaries } = await import('@nan0web/ai')
				const updated = applyBoundaries(
					{ [filePath]: originalContent },
					{ [key]: file.content.trimEnd() }
				)
				await fs.writeFile(fs.path.resolve(filePath), updated[filePath])
				file.content = updated[filePath]
				file.startLine = undefined
				file.lineCount = undefined
			}
		}

		// Unpack full files
		const { unpackAnswer } = await import('../../llm/unpack.js')
		const stream = unpackAnswer(parsed, false, cwd)
		for await (const _ of stream) {
			// consume to trigger write side-effects
		}

		const unpackedFiles = parsed.correct
			.filter((f) => f.filename && !f.filename.startsWith('@'))
			.map((f) => f.filename)

		// Run tests
		let testResult = null
		if (unpackedFiles.length > 0) {
			const { exec } = await import('node:child_process')
			testResult = await new Promise((resolve) => {
				exec('pnpm test', { cwd }, (error, stdout, stderr) => {
					resolve({ code: error ? error.code : 0, stdout, stderr })
				})
			})
		}

		return { unpackedFiles, testResult }
	}

	/**
	 * Main execution loop for the Chat session
	 * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
	 */
	async *run() {
		const { t } = this._
		const { ChatSession } = await import('@nan0web/ai')

		yield show(t(ChatSessionModel.UI.welcome, { $id: this.id, $date: this.date }))

		if (!this._.ai) {
			throw new Error(t(ChatSessionModel.UI.errorNoAi))
		}

		if (!this._.db) {
			throw new Error(t(ChatSessionModel.UI.errorNoDb))
		}
		await this._.db.connect()

		const chat = new ChatSession({ id: this.id, cwd: this._.db.cwd, root: 'chat' })
		await chat.init()
		await chat.load()

		const { FileSystem } = await import('../../utils/FileSystem.js')
		const fs = new FileSystem({ cwd: this._.db.cwd })

		if (chat.messages.length === 0) {
			await this.generateSystemPrompt()
			await ChatSessionModel.initSystemPrompt(chat, fs, this._.db.cwd)
		}

		while (true) {
			if (!this.input) {
				const res = yield ask('input', ChatSessionModel.input)
				if (res.cancelled) break
				this.input = res.value
			}

			// Pack input file into prompt context
			let promptText = this.input
			try {
				const packed = await ChatSessionModel.packInput(this.input, this._.db)
				promptText = packed.promptText
				if (packed.packedCount > 0) {
					yield show(t(ChatSessionModel.UI.packed, { files: packed.packedCount }), 'info')
				}
			} catch (/** @type {any} */ err) {
				yield show(t(ChatSessionModel.UI.errorApi, { message: err.message }), 'warn')
			}

			// Resolve model
			yield show(t(ChatSessionModel.UI.thinking), 'info')
			const modelId = this.model || 'gpt-oss-120b'
			const model = ChatSessionModel.resolveModel(this._.ai, modelId)

			if (!model) {
				yield show(t(ChatSessionModel.UI.errorModel, { model: modelId }), 'error')
				this.input = ''
				continue
			}

			// Stream response
			let answer = ''
			try {
				const messages = [...chat.messages, { role: 'user', content: promptText }]
				const stream = await this._.ai.streamText(/** @type {any} */ (model), messages)
				for await (const delta of stream.textStream) {
					answer += delta
					yield progress(t(ChatSessionModel.UI.streaming), answer.length)
				}
				yield progress('', 0, { stop: true })
				const rows = answer.split('\n')
				let short = rows[0]
				if (rows.length > 1)
					short += '\n' + t(ChatSessionModel.UI.moreLines, { count: rows.length - 1 })
				yield show(short, 'success')
			} catch (/** @type {any} */ err) {
				const msg = err.message || String(err)
				yield show(t(ChatSessionModel.UI.errorApi, { message: msg }), 'error')
				this.input = ''
				continue
			}

			chat.add({ role: 'user', content: promptText })
			chat.add({ role: 'assistant', content: answer })
			await chat.save()

			// Unpack files and run tests
			yield show(t(ChatSessionModel.UI.processing), 'info')
			try {
				const { unpackedFiles, testResult } = await ChatSessionModel.unpackAndTest(
					answer,
					fs,
					this._.db.cwd
				)

				if (unpackedFiles.length > 0) {
					yield show(
						t(ChatSessionModel.UI.unpacked, { files: unpackedFiles.join(', ') }),
						'success'
					)
				}

				if (testResult) {
					if (testResult.code === 0) {
						yield show(t(ChatSessionModel.UI.testOk), 'success')
					} else {
						yield show(t(ChatSessionModel.UI.testFailed, { code: testResult.code }), 'error')
						const errorLog = testResult.stderr || testResult.stdout
						if (errorLog) {
							yield show(errorLog.trim().slice(-600), 'warn')
						}
					}
				}
			} catch (/** @type {any} */ err) {
				yield show(t(ChatSessionModel.UI.errorApi, { message: err.message }), 'error')
			}

			this.input = '' // Reset for next iteration
		}

		return result({ status: 'ok', id: this.id })
	}
}
