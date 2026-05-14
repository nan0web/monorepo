import Observer from './Observer.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('Observer creation and entanglement', () => {
	const observer1 = new Observer('O1', 100)
	const observer2 = new Observer('O2', 50)

	assert.equal(observer1.id, 'O1', 'Observer ID should match')
	assert.equal(observer2.consciousnessLevel, 50, 'Consciousness level should be set')

	observer1.entangleWith(observer2)

	assert.ok(observer1.entangledObservers.has(observer2), 'Observers should be entangled')
	assert.ok(observer2.entangledObservers.has(observer1), 'Entanglement should be mutual')
})

test('Observer string representation', () => {
	const observer = new Observer('Test', 10)
	assert.match(
		observer.toString(),
		/Test \(10\) \[0 entagles\]/,
		'String representation should match format',
	)
})
