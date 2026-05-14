import test from 'node:test'
import assert from 'assert/strict'
import { Model } from '../../../../../domain/Model.js'

test('v1.7.3 - Model default t function replaces variables', () => {
	const model = new Model()
	const t = model._.t
	assert.equal(t('Hello {name}', { name: 'World' }), 'Hello World')
	assert.equal(t('Value is {val}', { val: 42 }), 'Value is 42')
	assert.equal(t('Missing {key}'), 'Missing {key}')
})
