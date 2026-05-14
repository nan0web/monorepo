import Observer from './Observer.js'
import Phenomenon from './Phenomenon.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('Multiple observer interaction', () => {
	const observer1 = new Observer('O1', 100)
	const observer2 = new Observer('O2', 50)
	const phen = new Phenomenon('initial')

	phen.addState('up', 0.5)
	phen.addState('down', 0.5)

	// Create entanglement between phenomena to ensure same result
	const phen2 = new Phenomenon('initial')
	phen.entangleWith(phen2)

	const obs1Result = phen.collapse(observer1)
	const obs2Result = phen2.collapse(observer2)

	assert.equal(
		obs1Result.state,
		obs2Result.state,
		'Observers should get same result from entangled phenomenon',
	)
})

test('World creation scenario', () => {
	const observer = new Observer('Cosmic', 1000)
	const phen = new Phenomenon('initial')

	phen.addState('big_bang', 1)
	const observation = phen.collapse(observer)

	assert.equal(observation.state, 'big_bang', 'World creation should follow quantum rules')
})

test('Conflict resolution - war scenario', () => {
	const observer1 = new Observer('NationA', 900)
	const observer2 = new Observer('NationB', 800)
	const phen = new Phenomenon('peace')

	phen.addState('peace', 0.7)
	phen.addState('war', 0.3)

	const obs1Result = phen.collapse(observer1)
	const obs2Result = phen.collapse(observer2)

	assert.equal(obs1Result.state, obs2Result.state, 'Both nations should observe same reality')
})
