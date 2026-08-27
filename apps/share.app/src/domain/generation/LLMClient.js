import { AI, ModelInfo } from '@nan0web/ai'

/**
 * LLMClient — Bridge to @nan0web/ai kernel with session metrics and streaming support.
 */
export class LLMClient {
	/** @type {AI?} */
	static #ai = null

	/**
	 * Get or lazily initialize the singleton @nan0web/ai instance.
	 * @returns {Promise<AI>}
	 */
	static async getAI() {
		if (!this.#ai) {
			this.#ai = new AI()
			await this.#ai.refreshModels()
		}
		return this.#ai
	}

	/**
	 * Accumulated session metrics.
	 */
	static metrics = {
		promptTokens: 0,
		completionTokens: 0,
		totalTokens: 0,
		totalCost: 0,
		calls: 0,
	}

	/**
	 * Reset session metrics.
	 */
	static resetMetrics() {
		this.metrics = {
			promptTokens: 0,
			completionTokens: 0,
			totalTokens: 0,
			totalCost: 0,
			calls: 0,
		}
	}

	/**
	 * Send a prompt using @nan0web/ai with automatic fallback, streaming, and cost calculation.
	 * @param {string} prompt
	 * @param {object} [options]
	 * @param {string} [options.system]
	 * @param {string} [options.model]
	 * @param {number} [options.temperature]
	 * @param {Function} [options.onToken] - (chunk: string, fullTextSoFar: string) => void
	 * @returns {Promise<string|null>}
	 */
	static async complete(prompt, options = {}) {
		const ai = await this.getAI()
		const systemPrompt = options.system || 'You are an expert technical editor, software architect, and technical writer.'

		// Resolve requested or best model
		let targetModel = null
		if (options.model) {
			targetModel = ai.findModel(options.model)
			if (!targetModel) {
				// Construct ModelInfo on the fly if not yet cached in provider registry
				const isPath = options.model.includes('/')
				const provider = isPath ? options.model.split('/')[0] : (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'cerebras')
				const id = options.model
				targetModel = new ModelInfo({ id, provider, name: id })
			}
		} else {
			targetModel = ai.selectedModel
			if (!targetModel) {
				const models = Array.from(ai.getModels())
				targetModel =
					models.find(m => m.id.includes('gpt-oss-120b') || m.id.includes('llama-4') || m.id.includes('llama-3.3')) ||
					models[0] ||
					new ModelInfo({ id: 'openai/gpt-oss-120b', provider: 'openrouter', name: 'GPT OSS 120B' })
			}
		}

		const messages = [
			{ role: 'user', content: prompt }
		]

		try {
			if (options.onToken) {
				// Use @nan0web/ai streamTextGenerator
				let fullText = ''
				const gen = ai.streamTextGenerator(targetModel, messages, {
					system: systemPrompt,
				})

				for await (const chunk of gen) {
					fullText += chunk
					options.onToken(chunk, fullText)
				}

				const result = (await gen.next()).value || {}
				const usage = result.usage

				const pTokens = usage?.promptTokens || Math.ceil((prompt.length + systemPrompt.length) / 3.5)
				const cTokens = usage?.completionTokens || Math.ceil(fullText.length / 3.5)

				this.metrics.promptTokens += pTokens
				this.metrics.completionTokens += cTokens
				this.metrics.totalTokens += (pTokens + cTokens)
				this.metrics.calls += 1

				const pricing = targetModel.pricing?.prompt
					? targetModel.pricing
					: { prompt: 0.03, completion: 0.17 }

				const costPrompt = (pTokens / 1000000) * (pricing.prompt || 0.03)
				const costComp = (cTokens / 1000000) * (pricing.completion || 0.17)
				this.metrics.totalCost += (costPrompt + costComp)

				return fullText.trim()
			} else {

				// Use @nan0web/ai generateText
				const response = await ai.generateText(targetModel, messages, {
					system: systemPrompt,
				})

				const text = response.text || ''
				const usage = response.usage

				const pTokens = usage?.inputTokens || Math.ceil((prompt.length + systemPrompt.length) / 3.5)
				const cTokens = usage?.outputTokens || Math.ceil(text.length / 3.5)

				this.metrics.promptTokens += pTokens
				this.metrics.completionTokens += cTokens
				this.metrics.totalTokens += (pTokens + cTokens)
				this.metrics.calls += 1

				const pricing = targetModel.pricing?.prompt
					? targetModel.pricing
					: { prompt: 0.03, completion: 0.17 }

				const costPrompt = (pTokens / 1000000) * (pricing.prompt || 0.03)
				const costComp = (cTokens / 1000000) * (pricing.completion || 0.17)
				this.metrics.totalCost += (costPrompt + costComp)

				return text.trim()
			}
		} catch (err) {
			console.error(`\x1b[31m[share.app LLM Error]: ${err.message}\x1b[0m`)
			return null
		}
	}
}

