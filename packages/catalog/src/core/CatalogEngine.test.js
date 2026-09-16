import assert from 'node:assert/strict'
import test from 'node:test'
import { CatalogEngine } from './CatalogEngine.js'

test('CatalogEngine filters items by category and search query', () => {
	const items = [
		{ id: '1', name: 'Alpha Card', type: 'MasterCard', tags: ['vip', 'card'] },
		{ id: '2', name: 'Beta Card', type: 'Visa', tags: ['standard', 'card'] },
		{ id: '3', name: 'Gamma Account', type: 'Account', tags: ['deposit'] },
	]

	const engine = new CatalogEngine(items)

	assert.equal(engine.getItems().length, 3)
	assert.equal(engine.getItems('all').length, 3)

	const mastercards = engine.getItems('MasterCard')
	assert.equal(mastercards.length, 1)
	assert.equal(mastercards[0].id, '1')

	const byTag = engine.getItems('deposit')
	assert.equal(byTag.length, 1)
	assert.equal(byTag[0].id, '3')

	const bySearch = engine.getItems('all', 'Beta')
	assert.equal(bySearch.length, 1)
	assert.equal(bySearch[0].id, '2')
})
