import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { TestAI } from './TestAI.js'
import { Usage } from './Usage.js'

describe('AI.streamTextGenerator Story', () => {
	it('should yield text deltas and assemble full text', async () => {
		const ai = new TestAI(['Hello World from generator'])
		let collected = ''

		for await (const chunk of ai.streamTextGenerator(null, [])) {
			assert.ok(typeof chunk === 'string', 'Each chunk must be a string')
			collected += chunk
		}

		assert.strictEqual(collected, 'Hello World from generator')
	})

	it('should return { text, usage, usedModel, usedProvider } via generator return value', async () => {
		const model = { id: 'test-llm', provider: 'openai' }
		const messages = [{ role: 'user', content: 'ping' }]
		const ai = new TestAI(['Pong response'])

		const gen = ai.streamTextGenerator(model, messages)

		// Exhaust the generator
		let result
		while (true) {
			const { done, value } = await gen.next()
			if (done) {
				result = value
				break
			}
		}

		assert.ok(result, 'Generator must return a result object')
		assert.strictEqual(result.text, 'Pong response')
		assert.ok(result.usage instanceof Usage, 'usage must be a Usage instance')
		assert.strictEqual(result.usedModel, 'test-llm')
		assert.strictEqual(result.usedProvider, 'openai')
	})

	it('should rotate through multiple responses', async () => {
		const ai = new TestAI(['First answer', 'Second answer'])

		// First call
		let text1 = ''
		for await (const chunk of ai.streamTextGenerator(null, [])) {
			text1 += chunk
		}
		assert.strictEqual(text1, 'First answer')

		// Second call
		let text2 = ''
		for await (const chunk of ai.streamTextGenerator(null, [])) {
			text2 += chunk
		}
		assert.strictEqual(text2, 'Second answer')
	})

	it('should handle empty response gracefully', async () => {
		const ai = new TestAI([''])
		const chunks = []

		const gen = ai.streamTextGenerator(null, [])
		let result
		while (true) {
			const { done, value } = await gen.next()
			if (done) {
				result = value
				break
			}
			chunks.push(value)
		}

		assert.strictEqual(chunks.length, 0, 'Empty response should yield no chunks')
		assert.ok(result, 'Must still return a result object')
		assert.strictEqual(result.text, '')
	})
})
