import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Human from './index.js'
import HumanContact from './Contact.js'
import HumanGender from './Gender.js'
import HumanName from './Name.js'

describe('Human', () => {
	it('should export all Human classes', () => {
		assert.ok(Human.Contact === HumanContact)
		assert.ok(Human.Gender === HumanGender)
		assert.ok(Human.Name === HumanName)
	})
})
