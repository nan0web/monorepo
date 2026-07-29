import { ModelInfo } from '../domain/ModelInfo.js'
import { Pricing } from '../domain/Pricing.js'
import { Architecture } from '../domain/Architecture.js'

function getModels() {
	/** @type {Array<[string, {context_length: number, prompt: number, completion: number}]>} */
	const models = [
		['mistral-large-latest', { context_length: 128_000, prompt: 2.0, completion: 6.0 }],
		['mistral-small-latest', { context_length: 128_000, prompt: 0.1, completion: 0.3 }],
		['codestral-latest', { context_length: 32_000, prompt: 0.2, completion: 0.6 }],
		['open-mixtral-8x22', { context_length: 64_000, prompt: 0.9, completion: 2.7 }],
		['open-mixtral-8x7b', { context_length: 32_000, prompt: 0.7, completion: 0.7 }],
		['open-mistral-7b', { context_length: 32_000, prompt: 0.25, completion: 0.25 }],
	]
	return { models }
}

function makeFlat(models = []) {
	const predefined = getModels()
	const map = new Map(predefined.models)
	const result = []

	// Start with predefined if models is empty
	const ids = new Set(models.map((m) => m.id))
	const combined = [...models]
	for (const [id, opts] of predefined.models) {
		if (!ids.has(id)) combined.push({ id, ...opts })
	}

	for (const model of combined) {
		const pre = map.get(model.id)
		result.push(
			new ModelInfo({
				id: model.id,
				provider: 'mistral',
				context_length: model.context_length ?? pre?.context_length ?? 32_000,
				pricing: new Pricing({
					prompt: model.pricing?.prompt ?? pre?.prompt ?? 0,
					completion: model.pricing?.completion ?? pre?.completion ?? 0,
				}),
				architecture: new Architecture({ input_modalities: ['text'], output_modalities: ['text'] }),
			})
		)
	}
	return result
}

export default { getModels, makeFlat }
