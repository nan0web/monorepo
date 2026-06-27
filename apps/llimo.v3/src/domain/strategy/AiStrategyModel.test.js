import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { StrategyListModel, StrategyAddModel, StrategyRemoveModel, StrategyApp } from './AiStrategyModel.js'

async function runGenerator(gen) {
	const events = []
	while (true) {
		const { value, done } = await gen.next()
		if (value) {
			// If it's a result, it might be the return value or yielded
			events.push(value)
		}
		if (done) break
	}
	return events
}

describe('Strategy Domain Models', () => {
	it('should list, add, and remove models in strategy queue via DB', async () => {
		const db = new DB({
			predefined: [
				['.agent/strategy.json', {
					cascadeQueue: ['model1', 'model2'],
					budgetLimitUsd: 1.5,
					timeoutMs: 5000,
					failoverLimit: 2,
					retryCount: 0,
					fallbackCodes: ['500'],
					concurrencyLimit: 1,
					cachingMode: 'none'
				}]
			]
		})
		await db.connect()

		// 1. List
		const listApp = new StrategyListModel({}, {
			db,
			t: (key) => key
		})
		
		const listEvents = await runGenerator(listApp.run())
		const listResult = listEvents.find(e => e && e.type === 'result')
		assert.ok(listResult)
		assert.deepStrictEqual(listResult.data.strategy.cascadeQueue, ['model1', 'model2'])

		// 2. Add
		const addApp = new StrategyAddModel({ model: 'model3' }, {
			db,
			t: (key) => key
		})

		const addEvents = await runGenerator(addApp.run())
		const addResult = addEvents.find(e => e && e.type === 'result')
		assert.ok(addResult)
		assert.deepStrictEqual(addResult.data.queue, ['model1', 'model2', 'model3'])

		// Verify saved back to DB
		const updatedConfig = await db.fetch('.agent/strategy.json')
		assert.deepStrictEqual(updatedConfig.cascadeQueue, ['model1', 'model2', 'model3'])

		// 3. Remove
		const removeApp = new StrategyRemoveModel({ model: 'model2' }, {
			db,
			t: (key) => key
		})

		const removeEvents = await runGenerator(removeApp.run())
		const removeResult = removeEvents.find(e => e && e.type === 'result')
		assert.ok(removeResult)
		assert.deepStrictEqual(removeResult.data.queue, ['model1', 'model3'])

		// Verify saved back to DB
		const finalConfig = await db.fetch('.agent/strategy.json')
		assert.deepStrictEqual(finalConfig.cascadeQueue, ['model1', 'model3'])
	})

	it('should route commands in StrategyApp container model', async () => {
		const db = new DB({
			predefined: [
				['.agent/strategy.json', {
					cascadeQueue: ['model1', 'model2'],
					budgetLimitUsd: 1.5,
					timeoutMs: 5000,
					failoverLimit: 2,
					retryCount: 0,
					fallbackCodes: ['500'],
					concurrencyLimit: 1,
					cachingMode: 'none'
				}]
			]
		})
		await db.connect()

		const strategyApp = new StrategyApp({ command: 'list' }, {
			db,
			t: (key) => key
		})

		const events = await runGenerator(strategyApp.run())
		const resultEvent = events.find(e => e && e.type === 'result')
		assert.ok(resultEvent)
		assert.deepStrictEqual(resultEvent.data.strategy.cascadeQueue, ['model1', 'model2'])
	})
})
