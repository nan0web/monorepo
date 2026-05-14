import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import * as Verse from './index.js'
import HumanContact from './Human/Contact.js'
import HumanGender from './Human/Gender.js'
import HumanName from './Human/Name.js'
import I from './I/I.js'
import We from './We/We.js'

describe('Verse', () => {
	it('should export all main classes', () => {
		assert.ok(Verse.HumanContact === HumanContact)
		assert.ok(Verse.HumanGender === HumanGender)
		assert.ok(Verse.HumanName === HumanName)
		assert.ok(Verse.I === I)
		assert.ok(Verse.We === We)
	})
})
