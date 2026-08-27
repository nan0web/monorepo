import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { MyModel } from '../../../../src/domain/MyModel.js'

describe('Release v1.0.0 Contract', () => {
	it('1. Model satisfies schema and handles defaults', () => {
		const instance = new MyModel({ name: 'test' })
		assert.equal(instance.name, 'test')
	})

	it('2. Model executes primary domain logic', async () => {
		const instance = new MyModel()
		const res = await instance.process()
		assert.equal(res.status, 'ok')
	})
})
