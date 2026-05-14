import test from 'node:test'
import assert from 'node:assert'
import { Blueprint } from './Blueprint.js'

test('Blueprint Model - initializes with default values', () => {
	const bp = new Blueprint()
	assert.strictEqual(bp.blueprint, true)
	assert.strictEqual(bp.name, 'new-agent')
	assert.strictEqual(bp.description, 'Zero-Hallucination Agent')
	assert.strictEqual(bp.version, '1.0.0')
	assert.strictEqual(bp.strictness, 'zero-hallucination')
})

test('Blueprint Model - resolves aliases correctly', () => {
	const bp = new Blueprint({
		name: 'my-agent', // alias for _name
		desc: 'A cool agent', // alias for description
		v: '1.2.3', // alias for version
		bp: false, // alias for blueprint
	})

	assert.strictEqual(bp.name, 'my-agent')
	assert.strictEqual(bp.description, 'A cool agent')
	assert.strictEqual(bp.version, '1.2.3')
	assert.strictEqual(bp.blueprint, false)
})

test('Blueprint Model - overrides defaults with provided values', () => {
	const bp = new Blueprint({
		name: 'test-agent',
		description: 'Test description',
		version: '2.0.0',
		strictness: 'flexible',
		blueprint: false,
	})

	assert.strictEqual(bp.name, 'test-agent')
	assert.strictEqual(bp.description, 'Test description')
	assert.strictEqual(bp.version, '2.0.0')
	assert.strictEqual(bp.strictness, 'flexible')
	assert.strictEqual(bp.blueprint, false)
})

test('Blueprint Model - validates name length', () => {
	assert.strictEqual(Blueprint._name.validate('abc'), true)
	assert.strictEqual(Blueprint._name.validate('ab'), 'Name must be at least 3 characters long')
	assert.strictEqual(Blueprint._name.validate(null), 'Name must be at least 3 characters long')
})
