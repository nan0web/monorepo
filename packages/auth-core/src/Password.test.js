import { suite, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Password from './Password.js'

suite('Password', () => {
	describe('hash()', () => {
		it('returns salt:hash hex format', () => {
			const hash = Password.hash('test')
			assert.match(hash, /^[a-f0-9]{32}:[a-f0-9]{64}$/)
		})

		it('produces unique salts each time', () => {
			const h1 = Password.hash('test')
			const h2 = Password.hash('test')
			assert.notEqual(h1, h2)
		})

		it('accepts empty projectSalt', () => {
			const hash = Password.hash('test', '')
			assert.match(hash, /^[a-f0-9]{32}:[a-f0-9]{64}$/)
		})
	})

	describe('verify()', () => {
		it('matches correct password', () => {
			const hash = Password.hash('sovereign')
			assert.ok(Password.verify('sovereign', hash))
		})

		it('rejects wrong password', () => {
			const hash = Password.hash('sovereign')
			assert.ok(!Password.verify('wrong', hash))
		})

		it('supports plain string fallback', () => {
			assert.ok(Password.verify('pass', 'pass'))
			assert.ok(!Password.verify('wrong', 'pass'))
		})

		it('with projectSalt — matches same salt', () => {
			const hash = Password.hash('test', 'MY_SALT')
			assert.ok(Password.verify('test', hash, 'MY_SALT'))
		})

		it('with projectSalt — rejects wrong salt', () => {
			const hash = Password.hash('test', 'MY_SALT')
			assert.ok(!Password.verify('test', hash, 'WRONG_SALT'))
		})

		it('with projectSalt — rejects empty salt', () => {
			const hash = Password.hash('test', 'MY_SALT')
			assert.ok(!Password.verify('test', hash, ''))
		})

		it('returns false for empty input', () => {
			assert.ok(!Password.verify('', 'hash'))
			assert.ok(!Password.verify('pass', ''))
			assert.ok(!Password.verify('', ''))
		})

		it('returns boolean type', () => {
			const hash = Password.hash('test')
			assert.equal(typeof Password.verify('test', hash), 'boolean')
			assert.equal(typeof Password.verify('wrong', hash), 'boolean')
		})
	})
})
