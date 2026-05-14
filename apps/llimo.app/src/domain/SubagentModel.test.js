import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SubagentModel } from './SubagentModel.js'

describe('SubagentModel', () => {
	describe('Model-as-Schema static fields', () => {
		it('has static model with help and default', () => {
			assert.equal(typeof SubagentModel.model.help, 'string')
			assert.equal(SubagentModel.model.default, '')
		})

		it('has static provider with help and default', () => {
			assert.equal(typeof SubagentModel.provider.help, 'string')
			assert.equal(SubagentModel.provider.default, '')
		})

		it('has static input with help, default and validate', () => {
			assert.equal(typeof SubagentModel.input.help, 'string')
			assert.equal(SubagentModel.input.default, '')
			assert.equal(typeof SubagentModel.input.validate, 'function')
		})

		it('has static file with help and default', () => {
			assert.equal(typeof SubagentModel.file.help, 'string')
			assert.equal(SubagentModel.file.default, '')
		})

		it('has static system with default prompt', () => {
			assert.ok(SubagentModel.system.default.length > 10)
		})
	})

	describe('Model-as-Schema UI (i18n)', () => {
		it('has i18n keys for all error messages', () => {
			assert.ok(SubagentModel.UI.model_or_strategy_required)
			assert.ok(SubagentModel.UI.input_or_file_required)
			assert.ok(SubagentModel.UI.file_not_found)
			assert.ok(SubagentModel.UI.connecting)
			assert.ok(SubagentModel.UI.generating)
			assert.ok(SubagentModel.UI.generation_failed)
			assert.ok(SubagentModel.UI.json_parse_failed)
		})
	})

	describe('Constructor defaults', () => {
		it('creates instance with all defaults', () => {
			const m = new SubagentModel()
			assert.equal(m.model, '')
			assert.equal(m.provider, '')
			assert.equal(m.strategy, '')
			assert.equal(m.input, '')
			assert.equal(m.file, '')
			assert.ok(m.system.length > 10)
		})

		it('overrides with partial data', () => {
			const m = new SubagentModel({ model: 'qwen/qwen3', input: 'test' })
			assert.equal(m.model, 'qwen/qwen3')
			assert.equal(m.input, 'test')
			assert.equal(m.provider, '')
		})
	})

	describe('OLMUI Generator contract', () => {
		it('run() is an async generator', () => {
			const m = new SubagentModel({ model: 'test', input: 'test' })
			const mockAI = /** @type {any} */ ({ streamText: () => {} })
			const gen = m.run({ ai: mockAI, modelInfo: { id: 'test', provider: 'test' } })
			assert.equal(typeof gen[Symbol.asyncIterator], 'function')
		})

		it('yields error log when no model and no strategy', async () => {
			const m = new SubagentModel({ input: 'test' })
			const gen = m.run({ ai: /** @type {any} */ ({}), modelInfo: { id: '', provider: '' } })
			const first = await gen.next()
			assert.equal(first.value.type, 'log')
			assert.equal(first.value.level, 'error')
			assert.equal(first.value.message, SubagentModel.UI.model_or_strategy_required)
		})

		it('yields error log when no input and no file', async () => {
			const m = new SubagentModel({ model: 'qwen' })
			const gen = m.run({ ai: /** @type {any} */ ({}), modelInfo: { id: 'qwen', provider: 'test' } })
			// First yield: status (connecting), skip it
			const first = await gen.next()
			// model is set, so it goes past model check → to prompt resolution
			// input is empty, file is empty → error
			assert.equal(first.value.type, 'log')
			assert.equal(first.value.level, 'error')
			assert.equal(first.value.message, SubagentModel.UI.input_or_file_required)
		})

		it('yields status intent with model and provider', async () => {
			const m = new SubagentModel({ model: 'qwen', input: 'hello' })
			const mockResult = {
				textStream: (async function* () { yield '{"ok":true}' })(),
				usage: Promise.resolve({ promptTokens: 10, completionTokens: 5, totalTokens: 15 }),
			}
			const mockAI = /** @type {any} */ ({ streamText: () => mockResult })
			const gen = m.run({ ai: mockAI, modelInfo: { id: 'qwen', provider: 'openrouter' } })

			const status = await gen.next()
			assert.equal(status.value.type, 'status')
			assert.equal(status.value.model.id, 'qwen')
			assert.equal(status.value.model.provider, 'openrouter')
		})

		it('full happy path: status → progress → chunk → summary → result', async () => {
			const m = new SubagentModel({ model: 'qwen', input: 'hello' })
			const mockResult = {
				textStream: (async function* () { yield '{"ok":true}' })(),
				usage: Promise.resolve({ promptTokens: 10, completionTokens: 5, totalTokens: 15 }),
			}
			const mockAI = /** @type {any} */ ({ streamText: () => mockResult })
			const gen = m.run({ ai: mockAI, modelInfo: { id: 'qwen', provider: 'openrouter', pricing: { calc: () => 0.001 } } })

			const intents = []
			for await (const intent of gen) {
				intents.push(intent)
			}

			const types = intents.map(i => i.type)
			assert.ok(types.includes('status'), 'must have status')
			assert.ok(types.includes('progress'), 'must have progress')
			assert.ok(types.includes('chunk'), 'must have chunk')
			assert.ok(types.includes('summary'), 'must have summary')

			const summary = /** @type {any} */ intents.find(i => i.type === 'summary')
			assert.ok(/** @type {any} */(summary).usage)
			assert.equal(/** @type {any} */(summary).usage.totalTokens, 15)
			assert.ok(/** @type {any} */(summary)?.stats?.speed > 0)
			assert.equal(/** @type {any} */(summary)?.stats?.cost, 0.001)
		})
	})
})
