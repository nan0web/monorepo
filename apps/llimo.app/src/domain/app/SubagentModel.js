import { readFileSync, existsSync } from 'node:fs'
import { AiModelAsApp } from './AiModelAsApp.js'
import { show, progress, result } from '@nan0web/ui'

/**
 * 📐 MODEL-AS-SCHEMA + MODEL-AS-APP
 * Domain Model for the LLiMo Subagent (Headless JSONL Worker).
 *
 * @property {string} model LLM model ID (e.g. qwen/qwen-3)
 * @property {string} provider API provider (e.g. openrouter, cerebras)
 * @property {string} strategy Fallback strategy name from ai-strategy.yaml
 * @property {string} input Raw prompt text
 * @property {string} file Path to a file with the prompt content
 * @property {string} system System prompt override
 */
export class SubagentModel extends AiModelAsApp {
	static alias = 'subagent'

	static model = {
		help: 'LLM model ID (e.g. qwen/qwen-3)',
		default: '',
	}

	static provider = {
		help: 'API provider (e.g. openrouter, cerebras)',
		default: '',
	}

	static strategy = {
		help: 'Fallback strategy name from ai-strategy.yaml',
		default: '',
	}

	static input = {
		help: 'Raw prompt text',
		default: '',
		validate: (val, instance) => {
			if (val || instance?.file) return true
			return 'input_or_file_required'
		},
	}

	static file = {
		help: 'Path to a file with the prompt content',
		default: '',
	}

	static system = {
		help: 'System prompt override',
		default: 'You are a subagent worker. Process the user request. Respond exclusively with a valid JSON. Do not include markdown code block tags.',
	}

	static UI = {
		model_or_strategy_required: 'Model or strategy is required',
		input_or_file_required: 'Input text or file path is required',
		file_not_found: 'File not found',
		connecting: 'Connecting to LLM',
		generating: 'Generating response',
		generation_failed: 'LLM generation failed',
		json_parse_failed: 'Failed to parse JSON from LLM response',
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.model = data.model || ''
		/** @type {string} */ this.provider = data.provider || ''
		/** @type {string} */ this.strategy = data.strategy || ''
		/** @type {string} */ this.input = data.input || ''
		/** @type {string} */ this.file = data.file || ''
		/** @type {string} */ this.system = data.system ?? SubagentModel.system.default
		
		// Injected modelInfo fallback/context
		this.modelInfo = options.modelInfo || null
	}

	/**
	 * @override
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const { t } = this._
		const ai = /** @type {any} */ (this._.ai)

		// 1. Validate required fields
		if (!this.model && !this.strategy) {
			yield show(t(SubagentModel.UI.model_or_strategy_required), 'error')
			return result({ status: 'failed', reason: 'no_model' })
		}

		// 2. Resolve final prompt text
		let finalPrompt = this.input
		if (this.file) {
			if (!existsSync(this.file)) {
				yield show(`${t(SubagentModel.UI.file_not_found)}: ${this.file}`, 'error')
				return result({ status: 'failed', reason: 'file_not_found' })
			}
			const fileContent = readFileSync(this.file, 'utf8')
			finalPrompt = finalPrompt ? `${finalPrompt}\n\n${fileContent}` : fileContent
		}

		if (!finalPrompt) {
			yield show(t(SubagentModel.UI.input_or_file_required), 'error')
			return result({ status: 'failed', reason: 'no_input' })
		}

		// Resolve model info
		const resolvedModelInfo = this.modelInfo || (ai && (ai.findModel(this.model) || (this.model ? { id: this.model, provider: this.provider || 'openrouter' } : null)))
		if (!resolvedModelInfo) {
			yield show(t(SubagentModel.UI.model_or_strategy_required), 'error')
			return result({ status: 'failed', reason: 'no_model_info' })
		}

		// 3. Signal connection
		yield {
			type: 'status',
			msg: t(SubagentModel.UI.connecting),
			model: {
				id: resolvedModelInfo.id,
				name: resolvedModelInfo.name || resolvedModelInfo.id,
				provider: resolvedModelInfo.provider,
				context_length: resolvedModelInfo.context_length,
				maximum_output: resolvedModelInfo.maximum_output,
				pricing: {
					prompt: resolvedModelInfo.pricing?.prompt || 0,
					completion: resolvedModelInfo.pricing?.completion || 0,
				}
			},
		}

		const messages = [
			{ role: 'system', content: this.system },
			{ role: 'user', content: finalPrompt },
		]

		// 4. Stream generation
		yield progress(t(SubagentModel.UI.generating))

		const start = Date.now()
		let completeText = ''
		let tokenUsage = null

		try {
			const streamResult = await ai.streamText(resolvedModelInfo, /** @type {any} */ (messages))

			for await (const chunk of streamResult.textStream) {
				completeText += chunk
				yield { type: 'chunk', text: chunk }
			}

			tokenUsage = (await streamResult.usage) || { promptTokens: 0, completionTokens: 0 }
		} catch (/** @type {any} */ err) {
			yield show(`${t(SubagentModel.UI.generation_failed)} [${resolvedModelInfo.id}]: ${err.message}`, 'error')
			return result({ status: 'failed', reason: 'llm_error', error: err.message })
		}

		const timeSec = (Date.now() - start) / 1000
		const totalTokens = tokenUsage.totalTokens || ((/** @type {any} */ (tokenUsage).promptTokens) + (/** @type {any} */ (tokenUsage).completionTokens)) || 0
		const speed = totalTokens / timeSec

		let cost = 0
		if (resolvedModelInfo.pricing && typeof resolvedModelInfo.pricing.calc === 'function') {
			cost = resolvedModelInfo.pricing.calc({
				inputTokens: (/** @type {any} */ (tokenUsage).promptTokens) || 0,
				outputTokens: (/** @type {any} */ (tokenUsage).completionTokens) || 0,
			})
		}

		// 5. Summary intent
		yield {
			type: 'summary',
			model: resolvedModelInfo.id,
			provider: resolvedModelInfo.provider,
			usage: {
				promptTokens: (/** @type {any} */ (tokenUsage).promptTokens) || 0,
				completionTokens: (/** @type {any} */ (tokenUsage).completionTokens) || 0,
				totalTokens,
			},
			stats: {
				speed: Number(speed.toFixed(2)),
				cost,
				time: Number(timeSec.toFixed(2)),
			},
		}

		// 6. Parse JSON (Zero-Hallucination)
		let payload = null
		try {
			const { cleanAndParseJSON } = await import('../../utils/jsonCleaner.js')
			payload = cleanAndParseJSON(completeText)
		} catch (/** @type {any} */ err) {
			yield show(`${t(SubagentModel.UI.json_parse_failed)}: ${err.message}`, 'error')
			return result({ status: 'failed', reason: 'json_parse', raw: completeText.slice(0, 200) })
		}

		return result({ status: 'ok', payload })
	}
}
