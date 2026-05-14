import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
	AuthServer,
	User,
	AuthDB,
	TokenManager,
	TokenRotationRegistry,
	AccessControl,
} from '../../../../../index.js'

describe('v1.1.2 - Усі необхідні класи експортуються з index.js', () => {
	it('Має експортувати AuthServer', () => {
		assert.ok(AuthServer, 'AuthServer не експортується')
		assert.equal(typeof AuthServer, 'function', 'AuthServer має бути класом')
	})

	it('Має експортувати User', () => {
		assert.ok(User, 'User не експортується')
		assert.equal(typeof User, 'function', 'User має бути класом')
	})

	it('Має експортувати AuthDB', () => {
		assert.ok(AuthDB, 'AuthDB не експортується')
		assert.equal(typeof AuthDB, 'function', 'AuthDB має бути класом')
	})

	it('Має експортувати TokenManager', () => {
		assert.ok(TokenManager, 'TokenManager не експортується')
		assert.equal(typeof TokenManager, 'function', 'TokenManager має бути класом')
	})

	it('Має експортувати TokenRotationRegistry', () => {
		assert.ok(TokenRotationRegistry, 'TokenRotationRegistry не експортується')
		assert.equal(typeof TokenRotationRegistry, 'function', 'TokenRotationRegistry має бути класом')
	})

	it('Має експортувати AccessControl', () => {
		assert.ok(AccessControl, 'AccessControl не експортується')
		assert.equal(typeof AccessControl, 'function', 'AccessControl має бути класом')
	})
})
