import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import We from './We.js'
import I from '../I/I.js'

describe('We', () => {
	it('should create instance with empty members by default', () => {
		const group = new We({})
		assert.ok(Array.isArray(group.members))
		assert.equal(group.members.length, 0)
	})

	it('should create instance with provided members', () => {
		const alice = new I('Alice')
		const bob = new I('Bob')
		const group = new We({ members: [alice, bob] })

		assert.equal(group.members.length, 2)
		assert.ok(group.members[0] instanceof I)
		assert.ok(group.members[1] instanceof I)
		assert.equal(group.members[0].value, 'Alice')
		assert.equal(group.members[1].value, 'Bob')
	})

	it('should convert members to I instances', () => {
		const group = new We({ members: ['Alice', 'Bob'] })

		assert.equal(group.members.length, 2)
		assert.ok(group.members[0] instanceof I)
		assert.ok(group.members[1] instanceof I)
		assert.equal(group.members[0].value, 'Alice')
		assert.equal(group.members[1].value, 'Bob')
	})

	it('should convert to string with newline separated members', () => {
		const alice = new I('Alice')
		const bob = new I('Bob')
		const group = new We({ members: [alice, bob] })

		assert.equal(String(group), 'Alice\nBob')
	})
})
