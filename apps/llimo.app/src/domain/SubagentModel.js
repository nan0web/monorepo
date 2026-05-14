import { readFileSync, existsSync } from 'node:fs'
import { Model } from '@nan0web/types'

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
export class SubagentModel extends Model {
	/**
	 * @param {Partial<SubagentModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {any} LLM model ID (e.g. qwen/qwen-3) */ this.model
		/** @type {any} API provider (e.g. openrouter, cerebras) */ this.provider
		/** @type {any} Fallback strategy name from ai-strategy.yaml */ this.strategy
		/** @type {any} Raw prompt text */ this.input
		/** @type {any} Path to a file with the prompt content */ this.file
		/** @type {any} System prompt override */ this.system
	}







	// ==========================================
	// 1. MODEL AS SCHEMA (Статичний опис полів)
	// ==========================================

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

	// ==========================================
	// 2. UI (i18n-ready labels for validation)
	// ==========================================

	static UI = {
		model_or_strategy_required: 'Model or strategy is required',
		input_or_file_required: 'Input text or file path is required',
		file_not_found: 'File not found',
		connecting: 'Connecting to LLM',
		generating: 'Generating response',
		generation_failed: 'LLM generation failed',
		json_parse_failed: 'Failed to parse JSON from LLM response',
	}

	// ==========================================
	// 4. AGNOSTIC LOGIC (Async Generator)
	// ==========================================

	/**
	 * Main execution generator — yields OLMUI intents.
	 * The adapter (CLI, headless JSONL, test harness) decides how to render them.
	 *
	 * @param {{ ai: import('../../src/llm/AI.js').AI, modelInfo: any }} deps
	 */
	async *run(deps) {
		const { ai, modelInfo } = deps

		// 1. Validate required fields
		if (!this.model && !this.strategy) {
			yield { type: 'log', level: 'error', message: SubagentModel.UI.model_or_strategy_required }
			return { status: 'failed', reason: 'no_model' }
		}

		// 2. Resolve final prompt text
		let finalPrompt = this.input
		if (this.file) {
			if (!existsSync(this.file)) {
				yield { type: 'log', level: 'error', message: `${SubagentModel.UI.file_not_found}: ${this.file}` }
				return { status: 'failed', reason: 'file_not_found' }
			}
			const fileContent = readFileSync(this.file, 'utf8')
			finalPrompt = finalPrompt ? `${finalPrompt}\n\n${fileContent}` : fileContent
		}

		if (!finalPrompt) {
			yield { type: 'log', level: 'error', message: SubagentModel.UI.input_or_file_required }
			return { status: 'failed', reason: 'no_input' }
		}

		// 3. Signal connection
		yield {
			type: 'status',
			msg: SubagentModel.UI.connecting,
			model: {
				id: modelInfo.id,
				name: modelInfo.name,
				provider: modelInfo.provider,
				context_length: modelInfo.context_length,
				maximum_output: modelInfo.maximum_output,
				pricing: {
					prompt: modelInfo.pricing?.prompt || 0,
					completion: modelInfo.pricing?.completion || 0,
				}
			},
		}

		const messages = [
			{ role: 'system', content: this.system },
			{ role: 'user', content: finalPrompt },
		]

		// 4. Stream generation
		yield { type: 'progress', message: SubagentModel.UI.generating }

		const start = Date.now()
		let completeText = ''
		let tokenUsage = null

		try {
			const result = ai.streamText(modelInfo, /** @type {any} */ (messages), {
				onChunk: (chunk) => {
					// Chunks are emitted via the adapter's onChunk callback
				},
			})

			for await (const chunk of result.textStream) {
				completeText += chunk
				yield { type: 'chunk', text: chunk }
			}

			tokenUsage = (await result.usage) || { promptTokens: 0, completionTokens: 0 }
		} catch (/** @type {any} */ err) {
			yield { type: 'log', level: 'error', message: `${SubagentModel.UI.generation_failed} [${modelInfo.id}]: ${err.message}` }
			return { status: 'failed', reason: 'llm_error', error: err.message }
		}

		const timeSec = (Date.now() - start) / 1000
		const totalTokens = tokenUsage.totalTokens || ((/** @type {any} */ (tokenUsage).promptTokens) + (/** @type {any} */ (tokenUsage).completionTokens)) || 0
		const speed = totalTokens / timeSec

		let cost = 0
		if (modelInfo.pricing && typeof modelInfo.pricing.calc === 'function') {
			cost = modelInfo.pricing.calc({
				inputTokens: (/** @type {any} */ (tokenUsage).promptTokens) || 0,
				outputTokens: (/** @type {any} */ (tokenUsage).completionTokens) || 0,
			})
		}

		// 5. Summary intent
		yield {
			type: 'summary',
			model: modelInfo.id,
			provider: modelInfo.provider,
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
			const { cleanAndParseJSON } = await import('../utils/jsonCleaner.js')
			payload = cleanAndParseJSON(completeText)
		} catch (/** @type {any} */ err) {
			yield { type: 'log', level: 'error', message: `${SubagentModel.UI.json_parse_failed}: ${err.message}` }
			return { status: 'failed', reason: 'json_parse', raw: completeText.slice(0, 200) }
		}

		// 7. Final result
		return { type: 'result', payload }
	}
}
