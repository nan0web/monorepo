#!/usr/bin/env node
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import { DatasetBuilder } from './fine-tune.js'

// Mock Logger to keep output clean in tests
class MockLogger {
	info(msg) {}
	debug(msg) {}
}

describe('DatasetBuilder Logic', () => {
	it('Should return new records only in Fresh mode (no old data passed)', () => {
		const builder = new DatasetBuilder({ logger: new MockLogger() })
		const newRecords = [{ id: 1 }, { id: 2 }]
		const oldRecords = []

		const result = builder.process(newRecords, oldRecords)
		assert.strictEqual(result.length, 2)
		assert.ok(result.some((r) => r.id === 1))
	})

	it('Should add 20% of old records in Incremental mode', () => {
		const builder = new DatasetBuilder({ logger: new MockLogger() })

		// New data: 5 items
		const newRecords = [1, 2, 3, 4, 5]
		// Old data: 10 items. 20% is 2 items.
		const oldRecords = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

		const result = builder.process(newRecords, oldRecords)

		// Total should be 5 (new) + 2 (approx old)
		// Since process shuffles, we check total length
		assert.strictEqual(result.length, 7)

		// Check uniqueness (no duplicates of IDs if we were using objects)
		// Since we used simple numbers, we just check sum to verify content mix
		const sum = result.reduce((a, b) => a + b, 0)
		// Sum of new (1+2+3+4+5=15) + random 2 from old.
		// Minimum sum if we pick 10 and 20: 15+30 = 45.
		// Max sum: 15 + 100+90 = 205.
		assert.ok(sum > 20 && sum < 220)
	})

	it('Should shuffle the final dataset', () => {
		const builder = new DatasetBuilder({ logger: new MockLogger() })
		const newRecords = [{ val: 'A' }]
		const oldRecords = [{ val: 'B' }, { val: 'C' }, { val: 'D' }, { val: 'E' }, { val: 'F' }]

		const result1 = builder.process(newRecords, oldRecords)
		const result2 = builder.process(newRecords, oldRecords)

		// Because of shuffle, the order should differ (highly unlikely to be same)
		// Checking array equality
		assert.notDeepStrictEqual(result1, result2)
	})
})
