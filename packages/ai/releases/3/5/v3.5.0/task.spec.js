import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ModelProvider } from '../../../../src/domain/ModelProvider.js'
import { AI } from '../../../../src/domain/AI.js'
import HetznerInfo from '../../../../src/providers/hetzner.info.js'

describe('Release v3.5.0: Hetzner AI Inference Provider Contract', () => {
	it('1. ModelProvider recognizes "hetzner" as an available provider', () => {
		assert.ok(ModelProvider.AvailableProviders.includes('hetzner'))
	})

	it('2. ModelProvider validates Hetzner API token with descriptive ModelError', () => {
		const originalToken = process.env.HETZNER_API_TOKEN
		const originalKey = process.env.HETZNER_API_KEY
		try {
			delete process.env.HETZNER_API_TOKEN
			delete process.env.HETZNER_API_KEY
			assert.equal(ModelProvider.hasApiKey('hetzner'), false)
			assert.throws(
				() => ModelProvider.validateApiKey('hetzner'),
				/HETZNER_API_TOKEN/
			)

			process.env.HETZNER_API_TOKEN = 'test-token-valid'
			assert.equal(ModelProvider.hasApiKey('hetzner'), true)
			assert.doesNotThrow(() => ModelProvider.validateApiKey('hetzner'))
		} finally {
			if (originalToken !== undefined) process.env.HETZNER_API_TOKEN = originalToken
			else delete process.env.HETZNER_API_TOKEN
			if (originalKey !== undefined) process.env.HETZNER_API_KEY = originalKey
			else delete process.env.HETZNER_API_KEY
		}
	})

	it('3. HetznerInfo provides static free models with zero pricing', () => {
		const flatModels = HetznerInfo.makeFlat(HetznerInfo.freeModels)
		assert.ok(flatModels.length >= 2)
		const qwen = flatModels.find((m) => m.id === 'Qwen/Qwen3.6-35B-A3B-FP8')
		assert.ok(qwen)
		assert.equal(qwen.provider, 'hetzner')
		assert.equal(qwen.pricing.prompt, 0)
		assert.equal(qwen.pricing.completion, 0)
	})

	it('4. AI instantiates OpenAI-compatible provider for Hetzner', async () => {
		const originalToken = process.env.HETZNER_API_TOKEN
		try {
			process.env.HETZNER_API_TOKEN = 'mock-hetzner-token'
			const ai = new AI()
			const provider = await ai.getProvider('hetzner')
			assert.ok(typeof provider === 'function')
			const model = provider('Qwen/Qwen3.6-35B-A3B-FP8')
			assert.ok(model)
			assert.equal(model.modelId, 'Qwen/Qwen3.6-35B-A3B-FP8')
		} finally {
			if (originalToken !== undefined) process.env.HETZNER_API_TOKEN = originalToken
			else delete process.env.HETZNER_API_TOKEN
		}
	})
})
