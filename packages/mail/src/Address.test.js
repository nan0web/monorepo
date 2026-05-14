import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import Address from './Address.js'

describe('Address class', () => {
	it('should initialize correctly with default values', () => {
		const address = new Address({ address: 'test@example.com' })
		assert.strictEqual(address.address, 'test@example.com')
		assert.strictEqual(address.name, '')
		assert.strictEqual(address.type, 'email')
	})

	it('should initialize correctly with provided values', () => {
		const address = new Address({
			address: 'test@example.com',
			name: 'Test User',
		})
		assert.strictEqual(address.address, 'test@example.com')
		assert.strictEqual(address.name, 'Test User')
		assert.strictEqual(address.type, 'email')
	})

	it('should convert to string with name', () => {
		const address = new Address({
			address: 'test@example.com',
			name: 'Test User',
		})
		assert.strictEqual(address.toString(), 'Test User <test@example.com>')
	})

	it('should convert to string without name', () => {
		const address = new Address({ address: 'test@example.com' })
		assert.strictEqual(address.toString(), '<test@example.com>')
	})

	it('should convert to object with specific fields', () => {
		const address = new Address({
			address: 'test@example.com',
			name: 'Test User',
		})
		const obj = address.toObject(['address', 'name'])
		assert.deepStrictEqual(obj, { address: 'test@example.com', name: 'Test User' })
	})

	it('should convert to object with all fields', () => {
		const address = new Address({
			address: 'test@example.com',
			name: 'Test User',
		})
		const obj = address.toObject()
		assert.deepStrictEqual(obj, {
			address: 'test@example.com',
			name: 'Test User',
			type: 'email',
		})
	})

	it('should create from string with name', () => {
		const address = Address.from('John Doe <john@example.com>')
		assert.ok(address instanceof Address)
		assert.strictEqual(address.address, 'john@example.com')
		assert.strictEqual(address.name, 'John Doe')
	})

	it('should create from string without name', () => {
		const address = Address.from('test@example.com')
		assert.ok(address instanceof Address)
		assert.strictEqual(address.address, 'test@example.com')
		assert.strictEqual(address.name, '')
	})

	it('should create from Address instance', () => {
		const original = new Address({ address: 'test@example.com', name: 'Test' })
		const address = Address.from(original)
		assert.strictEqual(address, original)
	})

	it('should create from object', () => {
		const address = Address.from({ address: 'test@example.com', name: 'Test' })
		assert.ok(address instanceof Address)
		assert.strictEqual(address.address, 'test@example.com')
		assert.strictEqual(address.name, 'Test')
	})
})
