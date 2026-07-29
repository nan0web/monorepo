import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { AiStrategyModel, StrategyListModel, StrategyAddModel, StrategyRemoveModel, StrategyMoveModel, StrategyEditModel } from './AiStrategyModel.js'
import { FileSystem } from '../utils/FileSystem.js'

describe('AiStrategyModel tests', () => {
	let tempDir = ''
	const llimoFs = new FileSystem()

	before(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'llimo-strategy-test-'))
	})

	after(async () => {
		try {
			await fs.rm(tempDir, { recursive: true, force: true })
		} catch {}
	})

	it('should instantiate with default values when no data is provided', () => {
		const strategy = new AiStrategyModel()
		assert.deepEqual(strategy.cascadeQueue, [
			'gpt-oss-120b@cerebras',
			'glm-4.7@cerebras',
			'llama3.1-8b@cerebras',
			'grok-2@openrouter',
			'meta-llama/llama-3.3-70b-instruct@openrouter',
			'anthropic/claude-3.5-sonnet@openrouter'
		])
		assert.equal(strategy.budgetLimitUsd, 2.00)
		assert.equal(strategy.timeoutMs, 60000)
		assert.equal(strategy.failoverLimit, 3)
		assert.equal(strategy.retryCount, 1)
		assert.deepEqual(strategy.fallbackCodes, ['429', '402', 'TIMEOUT', '503', 'error'])
		assert.equal(strategy.concurrencyLimit, 1)
		assert.equal(strategy.cachingMode, 'persist')
	})

	it('should instantiate with custom data values', () => {
		const custom = {
			cascadeQueue: ['custom-model-1', 'custom-model-2'],
			budgetLimitUsd: 15.50,
			timeoutMs: 12000,
			failoverLimit: 5,
			retryCount: 2,
			fallbackCodes: ['429', '500'],
			concurrencyLimit: 4,
			cachingMode: 'memory'
		}
		const strategy = new AiStrategyModel(custom)
		assert.deepEqual(strategy.cascadeQueue, custom.cascadeQueue)
		assert.equal(strategy.budgetLimitUsd, custom.budgetLimitUsd)
		assert.equal(strategy.timeoutMs, custom.timeoutMs)
		assert.equal(strategy.failoverLimit, custom.failoverLimit)
		assert.equal(strategy.retryCount, custom.retryCount)
		assert.deepEqual(strategy.fallbackCodes, custom.fallbackCodes)
		assert.equal(strategy.concurrencyLimit, custom.concurrencyLimit)
		assert.equal(strategy.cachingMode, custom.cachingMode)
	})

	it('should serialize and deserialize from .nan0 templates correctly', async () => {
		const strategyPath = path.join(tempDir, 'prod.strategy.nan0')
		const custom = new AiStrategyModel({
			cascadeQueue: ['test-model'],
			budgetLimitUsd: 5.00,
			timeoutMs: 8000
		})

		await custom.saveTemplate(strategyPath, llimoFs)

		// File should exist and contain raw JSON string (which is the .nan0 format)
		const exists = await fs.access(strategyPath).then(() => true).catch(() => false)
		assert.ok(exists, 'Strategy template file should exist')

		const loaded = await AiStrategyModel.loadTemplate(strategyPath, llimoFs)
		assert.deepEqual(loaded.cascadeQueue, ['test-model'])
		assert.equal(loaded.budgetLimitUsd, 5.00)
		assert.equal(loaded.timeoutMs, 8000)
		assert.equal(loaded.failoverLimit, 3) // Inherited from default
	})

	it('should produce a serializable payload via toPayload()', () => {
		const strategy = new AiStrategyModel({ cascadeQueue: ['a', 'b'], timeoutMs: 30000 })
		const payload = strategy.toPayload()
		assert.deepEqual(payload.cascadeQueue, ['a', 'b'])
		assert.equal(payload.timeoutMs, 30000)
		assert.ok(!('_' in payload), 'Payload must not contain internal fields')
	})

	it('should export all subcommand models', () => {
		assert.equal(StrategyListModel.alias, 'strategy:list')
		assert.equal(StrategyAddModel.alias, 'strategy:add')
		assert.equal(StrategyRemoveModel.alias, 'strategy:remove')
		assert.equal(StrategyMoveModel.alias, 'strategy:move')
		assert.equal(StrategyEditModel.alias, 'strategy:edit')
	})

	it('loadFromProject should return defaults when no local file', async () => {
		const { strategy, source } = await AiStrategyModel.loadFromProject(llimoFs)
		assert.equal(source, 'default')
		assert.ok(strategy instanceof AiStrategyModel)
		assert.ok(strategy.cascadeQueue.length > 0)
	})
})
