import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UITable from '../table.js'

describe('ui-table', () => {
	it('exports UITable class', () => {
		assert.ok(UITable)
		assert.equal(typeof UITable, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UITable.properties)
		assert.ok(UITable.properties.data)
		assert.ok(UITable.properties.columns)
		assert.equal(UITable.properties.data.type, Array)
		assert.equal(UITable.properties.columns.type, Array)
	})

	it('defines CSS styles', () => {
		assert.ok(UITable.styles)
		const css = UITable.styles.cssText || String(UITable.styles)
		assert.ok(css.includes('border-collapse'))
		assert.ok(css.includes('font-family'))
	})

	it('CSS includes hover effect on tr', () => {
		const css = UITable.styles.cssText || String(UITable.styles)
		assert.ok(css.includes('tr:hover'))
	})

	it('CSS has empty state styling', () => {
		const css = UITable.styles.cssText || String(UITable.styles)
		assert.ok(css.includes('.empty'))
	})

	it('has _cols getter in prototype', () => {
		// _cols is a computed property for column resolution
		const descriptor = Object.getOwnPropertyDescriptor(UITable.prototype, '_cols')
		assert.ok(descriptor, 'should have _cols accessor')
		assert.ok(descriptor.get, '_cols should be a getter')
	})
})
