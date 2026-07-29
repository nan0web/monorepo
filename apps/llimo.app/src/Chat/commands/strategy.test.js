import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { StrategyCommand } from './strategy.js'
import { SpecRunner } from '@nan0web/ui/testing'

const registry = {
	StrategyCommand
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

describe('StrategyCommand', () => {
	it('creates instance correctly via constructor and create method', () => {
		const cmd = new StrategyCommand()
		assert.strictEqual(cmd.constructor.name, 'strategy')
		assert.strictEqual(StrategyCommand.name, 'strategy')
		assert.ok(cmd instanceof StrategyCommand)

		const created = StrategyCommand.create({ argv: ['list'] })
		assert.strictEqual(created.subcommand, 'list')
	})

	it('routes list subcommand successfully using MockFileSystem', async () => {
		const stream = [
			{ StrategyCommand: { subcommand: 'list' } },
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
			{ result: false },
		]

		const res = await SpecRunner.execute(stream, registry, assert, { fs: new MockFileSystem() })
		assert.equal(res, false, 'Command should finish and return false')
	})
})
