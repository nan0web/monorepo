import Rea0ity from './Rea0ity.js'
import Potencial from './Potencial.js'
import test from 'node:test'
import assert from 'node:assert/strict'

test('Rea0ity superposition management', (t) => {
	const rea0ity = new Rea0ity()
	const potential1 = new Potencial('state1')
	const potential2 = new Potencial('state2')

	rea0ity.entangle([potential1, potential2])

	assert.ok(
		rea0ity.superposition.has(potential1.probability),
		'Superposition should include potentials',
	)
})
