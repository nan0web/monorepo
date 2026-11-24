import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PriorityEvaluator } from './PriorityEvaluator.js'

describe('PriorityEvaluator Contract', () => {
	it('computes table and pool presets', () => {
		assert.equal(PriorityEvaluator.table({ V: 5, U: 4, C: 2 }), 10)
		assert.equal(PriorityEvaluator.pool({ L: 1, F: 2, D: 1, S: 3 }), 143)
	})

	it('supports custom JS evaluator functions', () => {
		const sprintScore = (task, ctx) => (task.metrics?.V || 0) + (ctx.tasks?.length || 0)
		assert.equal(PriorityEvaluator.evaluate({ metrics: { V: 7 } }, sprintScore, { tasks: [1, 2, 3] }), 10)
	})
})
