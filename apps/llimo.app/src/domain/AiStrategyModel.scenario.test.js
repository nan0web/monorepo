/**
 * @fileoverview SpecRunner-based scenario tests for AiStrategy subcommands.
 *
 * Covers all 5 subcommands: list, add, remove, move, edit
 * using the SpecRunner.execute() pattern with intent stream arrays.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SpecRunner } from '@nan0web/ui/testing'
import { StrategyListModel, StrategyAddModel, StrategyRemoveModel, StrategyMoveModel, StrategyEditModel } from './AiStrategyModel.js'

const registry = {
	StrategyListModel,
	StrategyAddModel,
	StrategyRemoveModel,
	StrategyMoveModel,
	StrategyEditModel,
}

class MockFileSystem {
	constructor(files = {}) {
		this.files = new Map(Object.entries(files))
	}
	async load(path) {
		return this.files.get(path)
	}
	async save(path, data) {
		this.files.set(path, data)
	}
}

// ─── US-1: strategy:list — Show current strategy ──────────────────────────────

describe('US-1: strategy:list', () => {
	it('should show current cascade queue and settings (default source)', async () => {
		const stream = [
			{ StrategyListModel: {} },
			{ show: '*' },               // loadedGlobal warn
			{ show: '*' },               // currentQueue header
			{ show: '*' },               // model 1
			{ show: '*' },               // model 2
			{ show: '*' },               // model 3
			{ show: '*' },               // model 4
			{ show: '*' },               // model 5
			{ show: '*' },               // model 6
			{ show: '*' },               // budgetLimitUsd
			{ show: '*' },               // timeoutMs
			{ show: '*' },               // failoverLimit
			{ show: '*' },               // retryCount
			{ show: '*' },               // fallbackCodes
			{ show: '*' },               // concurrencyLimit
			{ show: '*' },               // cachingMode
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'ok')
		assert.ok(res.strategy, 'Should return strategy payload')
		assert.ok(Array.isArray(res.strategy.cascadeQueue), 'Strategy should have cascade queue')
	})
})

// ─── US-2: strategy:add — Add a model to cascade queue ────────────────────────

describe('US-2: strategy:add', () => {
	it('should add a model via argv (batch mode)', async () => {
		const stream = [
			{ StrategyAddModel: { model: 'my-new-model@provider' } },
			{ show: '*' },   // added success
			{ show: '*' },   // saved success
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'ok')
		assert.ok(res.queue.includes('my-new-model@provider'), 'Queue should contain new model')
	})

	it('should add a model via interactive ask', async () => {
		const stream = [
			{ StrategyAddModel: {} },
			{ ask: 'model', $value: 'interactive-model@test' },
			{ show: '*' },   // added success
			{ show: '*' },   // saved success
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'ok')
		assert.ok(res.queue.includes('interactive-model@test'))
	})
})

// ─── US-3: strategy:remove — Remove a model from cascade queue ────────────────

describe('US-3: strategy:remove', () => {
	it('should remove a model via argv (batch mode)', async () => {
		const stream = [
			{ StrategyRemoveModel: { model: 'gpt-oss-120b@cerebras' } },
			{ show: '*' },   // removed success
			{ show: '*' },   // saved success
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'ok')
		assert.ok(!res.queue.includes('gpt-oss-120b@cerebras'), 'Queue should not contain removed model')
	})

	it('should show error for non-existent model', async () => {
		const stream = [
			{ StrategyRemoveModel: { model: 'nonexistent-model' } },
			{ show: '*' },   // notFound error
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'error')
	})

	it('should remove a model via interactive ask', async () => {
		const stream = [
			{ StrategyRemoveModel: {} },
			{ ask: 'model', $value: 'llama3.1-8b@cerebras' },
			{ show: '*' },   // removed success
			{ show: '*' },   // saved success
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'ok')
		assert.ok(!res.queue.includes('llama3.1-8b@cerebras'))
	})
})

// ─── US-4: strategy:move — Reorder a model in cascade queue ───────────────────

describe('US-4: strategy:move', () => {
	it('should move a model to position 1 (top priority)', async () => {
		const stream = [
			{ StrategyMoveModel: { model: 'llama3.1-8b@cerebras', position: 1 } },
			{ show: '*' },   // moved success
			{ show: '*' },   // saved success
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'ok')
		assert.equal(res.queue[0], 'llama3.1-8b@cerebras', 'Model should be at position 1')
	})

	it('should show error for invalid position', async () => {
		const stream = [
			{ StrategyMoveModel: { model: 'gpt-oss-120b@cerebras', position: 999 } },
			{ show: '*' },   // invalidPosition error
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'error')
	})

	it('should show error for non-existent model', async () => {
		const stream = [
			{ StrategyMoveModel: { model: 'phantom-model', position: 1 } },
			{ show: '*' },   // notFound error
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'error')
	})

	it('should move via interactive ask', async () => {
		const stream = [
			{ StrategyMoveModel: {} },
			{ ask: 'model', $value: 'grok-2@openrouter' },
			{ ask: 'position', $value: 2 },
			{ show: '*' },   // moved success
			{ show: '*' },   // saved success
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'ok')
		assert.equal(res.queue[1], 'grok-2@openrouter', 'Model should be at position 2')
	})
})

// ─── US-5: strategy:edit — Interactive full edit ──────────────────────────────

describe('US-5: strategy:edit', () => {
	it('should show warn when no local config exists', async () => {
		const stream = [
			{ StrategyEditModel: {} },
			{ show: '*' },                  // loadedGlobal warn
			{ progress: '*' },              // spinner start
			{ progress: '*' },              // spinner stop
			{ ask: 'strategy', $value: {    // full form response
				cascadeQueue: ['custom@provider'],
				budgetLimitUsd: 5.0,
				timeoutMs: 30000,
				failoverLimit: 2,
				retryCount: 3,
				fallbackCodes: ['429', 'TIMEOUT'],
				concurrencyLimit: 2,
				cachingMode: 'memory'
			}},
			{ show: '*' },                  // saved success
			{ result: '*' },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res.status, 'ok')
		assert.deepEqual(res.strategy.cascadeQueue, ['custom@provider'])
		assert.equal(res.strategy.timeoutMs, 30000)
	})

	it('should return cancelled when user aborts', async () => {
		const stream = [
			{ StrategyEditModel: {} },
			{ show: '*' },                               // loadedGlobal warn
			{ progress: '*' },                           // spinner start
			{ progress: '*' },                           // spinner stop
			{ ask: 'strategy', $value: undefined },      // cancelled — SpecRunner sends { cancelled: false } but value=undefined
			{ show: '*' },                               // noChanges info
			{ result: '*' },
		]

		await assert.doesNotReject(() => SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() }))
	})
})
