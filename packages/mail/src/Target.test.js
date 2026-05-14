import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Target from './Target.js'
import Address from './Address.js'

describe('Target class', () => {
	it('should initialize with empty arrays for to, cc, bcc', () => {
		const target = new Target()
		assert.deepStrictEqual(target.get('to'), [])
		assert.deepStrictEqual(target.get('cc'), [])
		assert.deepStrictEqual(target.get('bcc'), [])
	})

	it('should add single address to "to" field by default', () => {
		const target = new Target()
		target.add('test@example.com')
		assert.strictEqual(target.get('to').length, 1)
		assert.ok(target.get('to')[0] instanceof Address)
		assert.strictEqual(target.get('to')[0].address, 'test@example.com')
	})

	it('should add address to specified field', () => {
		const target = new Target()
		target.add('test@example.com', 'cc')
		assert.strictEqual(target.get('cc').length, 1)
		assert.ok(target.get('cc')[0] instanceof Address)
		assert.strictEqual(target.get('cc')[0].address, 'test@example.com')
	})

	it('should throw error for invalid address type', () => {
		const target = new Target()
		assert.throws(() => {
			target.add('test@example.com', 'invalid')
		}, /Invalid address type: invalid/)
	})

	it('should add multiple addresses', () => {
		const target = new Target()
		target.add(['test1@example.com', 'test2@example.com'], 'bcc')
		assert.strictEqual(target.get('bcc').length, 2)
		assert.ok(target.get('bcc')[0] instanceof Address)
		assert.ok(target.get('bcc')[1] instanceof Address)
	})

	it('should create from string', () => {
		const target = Target.from('test@example.com')
		assert.ok(target instanceof Target)
		assert.strictEqual(target.get('to').length, 1)
		assert.strictEqual(target.get('to')[0].address, 'test@example.com')
	})

	it('should create from array of strings', () => {
		const target = Target.from(['test1@example.com', 'test2@example.com'])
		assert.ok(target instanceof Target)
		assert.strictEqual(target.get('to').length, 2)
		assert.strictEqual(target.get('to')[0].address, 'test1@example.com')
		assert.strictEqual(target.get('to')[1].address, 'test2@example.com')
	})

	it('should create from array of objects', () => {
		const target = Target.from([
			{ address: 'test1@example.com', type: 'to' },
			{ address: 'test2@example.com', type: 'cc' },
		])
		assert.ok(target instanceof Target)
		assert.strictEqual(target.get('to').length, 1)
		assert.strictEqual(target.get('cc').length, 1)
		assert.strictEqual(target.get('to')[0].address, 'test1@example.com')
		assert.strictEqual(target.get('cc')[0].address, 'test2@example.com')
	})

	it('should create from object with address fields', () => {
		const target = Target.from({
			to: 'test1@example.com',
			cc: 'test2@example.com',
			bcc: ['test3@example.com', 'test4@example.com'],
		})
		assert.ok(target instanceof Target)
		assert.strictEqual(target.get('to').length, 1)
		assert.strictEqual(target.get('cc').length, 1)
		assert.strictEqual(target.get('bcc').length, 2)
	})

	it('should format for nodemailer', () => {
		const target = new Target()
		target.add('John Doe <john@example.com>', 'to')
		target.add('jane@example.com', 'cc')
		target.add(['bob@example.com', 'alice@example.com'], 'bcc')

		const formatted = target.formatForNodemailer()
		assert.strictEqual(formatted.to, 'John Doe <john@example.com>')
		assert.strictEqual(formatted.cc, '<jane@example.com>')
		assert.strictEqual(formatted.bcc, '<bob@example.com>, <alice@example.com>')
	})
})
