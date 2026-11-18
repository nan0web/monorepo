import { ModelInfo } from '../domain/ModelInfo.js'
import { Pricing } from '../domain/Pricing.js'

/**
 * Supported Models for Hetzner Inference
 * Base URL: https://inference.hetzner.com/api/v1
 */
const HETZNER_MODELS_DATA = {
	'Qwen/Qwen3.6-35B-A3B-FP8': {
		context_length: 32_768,
		maximum_output: 8_192,
		pricing: { prompt: 0, completion: 0 },
		supports_tools: true,
		volume: 35e9,
	},
	'meta-llama/Llama-3.3-70B-Instruct': {
		context_length: 128_000,
		maximum_output: 8_192,
		pricing: { prompt: 0, completion: 0 },
		supports_tools: true,
		volume: 70e9,
	},
}

/**
 * Converts raw provider model objects into unified ModelInfo instances.
 * @param {object[]} models
 * @returns {ModelInfo[]}
 */
function makeFlat(models = []) {
	return models.map((m) => {
		const staticInfo = HETZNER_MODELS_DATA[m.id] || {}
		return new ModelInfo({
			...m,
			...staticInfo,
			provider: 'hetzner',
			context_length: staticInfo.context_length || m.context_length || 32_768,
			maximum_output: staticInfo.maximum_output || m.maximum_output || 8_192,
			pricing: new Pricing(staticInfo.pricing || m.pricing || { prompt: 0, completion: 0 }),
		})
	})
}

export default {
	makeFlat,
	freeModels: [
		{
			id: 'Qwen/Qwen3.6-35B-A3B-FP8',
			object: 'model',
			created: 0,
			owned_by: 'Hetzner',
		},
		{
			id: 'meta-llama/Llama-3.3-70B-Instruct',
			object: 'model',
			created: 0,
			owned_by: 'Hetzner',
		},
	],
}
