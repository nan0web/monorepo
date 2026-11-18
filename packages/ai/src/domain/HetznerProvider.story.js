import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ModelProvider } from './ModelProvider.js'
import { AI } from './AI.js'
import HetznerInfo from '../providers/hetzner.info.js'

describe('Scenario: Hetzner AI Inference Integration (OLMUI)', () => {
	it('1. ModelProvider recognizes "hetzner" as an available provider', () => {
		assert.ok(ModelProvider.AvailableProviders.includes('hetzner'))
	})

	it('2. ModelProvider validates Hetzner API key / token', () => {
		const originalToken = process.env.HETZNER_API_TOKEN
		const originalKey = process.env.HETZNER_API_KEY
		try {
			delete process.env.HETZNER_API_TOKEN
			delete process.env.HETZNER_API_KEY
			assert.equal(ModelProvider.hasApiKey('hetzner'), false)
			assert.throws(() => ModelProvider.validateApiKey('hetzner'), /HETZNER_API_TOKEN/)

			process.env.HETZNER_API_TOKEN = 'test-token-123'
			assert.equal(ModelProvider.hasApiKey('hetzner'), true)
			assert.doesNotThrow(() => ModelProvider.validateApiKey('hetzner'))
		} finally {
			if (originalToken !== undefined) process.env.HETZNER_API_TOKEN = originalToken
			else delete process.env.HETZNER_API_TOKEN
			if (originalKey !== undefined) process.env.HETZNER_API_KEY = originalKey
			else delete process.env.HETZNER_API_KEY
		}
	})

	it('3. hetzner.info provides static free models and makeFlat mapping', () => {
		const flatModels = HetznerInfo.makeFlat(HetznerInfo.freeModels)
		assert.ok(Array.isArray(flatModels))
		assert.ok(flatModels.length >= 2)

		const qwen = flatModels.find((m) => m.id === 'Qwen/Qwen3.6-35B-A3B-FP8')
		assert.ok(qwen)
		assert.equal(qwen.provider, 'hetzner')
		assert.equal(qwen.volume, 35e9)
		assert.equal(qwen.supports_tools, true)
		assert.equal(qwen.pricing.prompt, 0)
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
