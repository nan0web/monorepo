import { describe, it } from 'node:test'
import assert from 'node:assert'
import Root, { RootBody } from './Root.js'

describe('RootBody', () => {
	it('should create instance with default values', () => {
		const schema = new RootBody()
		assert.strictEqual(schema.debug, false)
	})

	it('should create instance with custom values', () => {
		const schema = new RootBody({ debug: true })
		assert.strictEqual(schema.debug, true)
	})
})

describe('Root', () => {
	it('should create instance with default values', () => {
		const message = new Root()
		assert.ok(message.body instanceof RootBody)
		assert.strictEqual(message.body.debug, false)
	})

	it('should have proper static properties', () => {
		// static name property on class overrides Function.name if environment supports it,
		// or serves as a static property.
		// However, class name is Root. The static property 'name' is 'auth'.
		// Let's assume the static property key is used.
		assert.strictEqual(Root.name, 'auth')
		assert.strictEqual(Root.help, 'User authentication commands')
		assert.ok(Root.Children.length === 1)
	})
})
