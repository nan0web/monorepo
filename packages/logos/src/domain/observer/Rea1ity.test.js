import Rea1ity from './Rea1ity.js'
import Observation from './Observation.js'
import Observer from './Observer.js'
import Phenomenon from './Phenomenon.js'
import test from 'node:test'
import assert from 'node:assert/strict'

test('Rea1ity observation process', () => {
	const observer = new Observer('Test', 100)
	const rea1ity = new Rea1ity(observer)
	const phen = new Phenomenon('initial')

	const observation = rea1ity.observe(phen)

	assert.ok(observation instanceof Observation, 'Observation should be created')
})
