import { Model } from '@nan0web/types'
import { randomUUID } from 'node:crypto'
import { show, ask, progress, result } from '@nan0web/ui'

/**
 * Contract for the injected AI Engine
 * @typedef {Object} AIEngineContract
 * @property {import('../llm/ModelInfo').default | null} selectedModel The currently selected AI model
 * @property {function(string): import('../llm/ModelInfo').default | undefined} getModel Get a model by ID
 * @property {function(string): import('../llm/ModelInfo').default | undefined} findModel Find a model by partial ID
 * @property {function(string, any[], any=): import('ai').StreamTextResult<any>} streamText Stream text from AI
 */

/**
 * Model-as-Schema for tracking metadata of an active LLiMo Engine execution or chat
 */
export class ChatSessionModel extends Model {
	/**
	 * @param {Partial<ChatSessionModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { ai?: AIEngineContract }} [options]
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
		/** @type {AIEngineContract | undefined} AI Provider instance */ this.ai = options.ai
		/** @type {string} Unique identifier for the chat session */ this.id
		/** @type {string} Date string formatted as YYYY-MM-DD for grouping logs */ this.date
		/** @type {string} Initial input prompt or path to file */ this.input
		/** @type {string} AI model to use for the session */ this.model
		/** @type {string} Absolute path to the directory hosting the chat artifacts (.csv, .log, .md) */ this
			.logsPath
		/** @type {string} Current status of the execution: active, ok, failed */ this.status
	}

	/**
	 * Main execution loop for the Chat session
	 */
	async *run() {
		const { t = (k, p) => k, db } = /** @type {any} */ (this._)
		const { ChatSession } = await import('@nan0web/ai')

		yield show(t(ChatSessionModel.UI.welcome, { $id: this.id, $date: this.date }))

		if (!this.ai) throw new Error('AI engine not injected')

		const chat = new ChatSession({ id: this.id, cwd: db.cwd, root: 'chat' })
		await chat.init()
		await chat.load()

		while (true) {
			if (!this.input) {
				const res = yield ask('input', ChatSessionModel.input)
				if (res.cancelled) break
				this.input = res.value
			}

			yield show(t(ChatSessionModel.UI.thinking), 'info')

			const modelId = this.model || 'gpt-4o'
			let model = this.ai.findModel(modelId)
			if (!model) {
				const models = this.ai.getModel(modelId)
				if (Array.isArray(models) && models.length > 0) model = models[0]
			}

			if (!model) {
				yield show(`Model not found: ${modelId}`, 'error')
				this.input = ''
				continue
			}

			let answer = ''
			try {
				const messages = [...chat.messages, { role: 'user', content: this.input }]
				const stream = await this.ai.streamText(/** @type {any} */ (model), messages)
				for await (const delta of stream.textStream) {
					answer += delta
					yield progress(t(ChatSessionModel.UI.streaming), answer.length)
				}
				yield show(answer)
			} catch (err) {
				const error = /** @type {any} */ (err)
				const msg = error.message || String(error)
				yield show(`API Error: ${msg.split('\n')[0]}`, 'error')
				this.input = ''
				continue
			}

			chat.add({ role: 'user', content: this.input })
			chat.add({ role: 'assistant', content: answer })
			await chat.save()

			yield show(t(ChatSessionModel.UI.processing), 'info')
			// TODO: Implement decodeAnswerAndRunTests logic here

			this.input = '' // Reset for next iteration
		}

		return result({ status: 'ok', id: this.id })
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
		validate: (val) =>
			['active', 'ok', 'failed'].includes(val) ? true : ChatSessionModel.UI.err_status,
	}

	static UI = {
		welcome: '🎼 LLiMo Chat Session: {$id} ({$date})',
		thinking: '🧠 LLiMo is thinking...',
		streaming: '✍️ Receiving stream...',
		processing: '📦 Processing artifacts and tests...',
		err_status: 'Invalid session status',
	}
}
