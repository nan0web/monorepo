import Phenomenon from './Phenomenon.js'
import Observer from './Observer.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('Phenomenon state management', () => {
	const phen = new Phenomenon('initial')

	phen.addState('state1', 0.3)
	phen.addState('state2', 0.7)

	assert.deepEqual(
		[...phen.probabilities.keys()],
		['initial', 'state1', 'state2'],
		'Probabilities should include all added states',
	)
})

test('Quantum collapse scenarios', () => {
	const observer = new Observer('Test', 100)
	const phen = new Phenomenon('initial')

	phen.addState('up', 0.5)
	phen.addState('down', 0.5)

	const observation = phen.collapse(observer)

	assert.ok(
		['initial', 'up', 'down'].includes(observation.state),
		'Collapse should select valid state',
	)
})

test('Entangled phenomena behavior', () => {
	const phen1 = new Phenomenon('initial')
	const phen2 = new Phenomenon('initial')

	phen1.entangleWith(phen2)

	phen1.addState('up', 1)
	phen2.addState('up', 1)

	const observer = new Observer('Test', 100)
	const observation = phen1.collapse(observer)

	assert.equal(observation.state, 'up', 'Entangled phenomena should collapse to same state')
})
