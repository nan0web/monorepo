import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UISortable from '../sortable.js'

describe('ui-sortable', () => {
	it('exports UISortable class', () => {
		assert.ok(UISortable)
		assert.equal(typeof UISortable, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UISortable.properties)
		assert.ok(UISortable.properties.items)
		assert.equal(UISortable.properties.items.type, Array)
	})

	it('defines CSS styles with list and item', () => {
		assert.ok(UISortable.styles)
		const css = UISortable.styles.cssText || String(UISortable.styles)
		assert.ok(css.includes('.list'), 'missing .list')
		assert.ok(css.includes('.item'), 'missing .item')
		assert.ok(css.includes('.handle'), 'missing .handle')
	})

	it('CSS includes drag states', () => {
		const css = UISortable.styles.cssText || String(UISortable.styles)
		assert.ok(css.includes('.dragging'), 'missing .dragging state')
		assert.ok(css.includes('.over'), 'missing .over drop zone')
	})

	it('CSS includes grab cursor', () => {
		const css = UISortable.styles.cssText || String(UISortable.styles)
		assert.ok(css.includes('grab'), 'missing grab cursor')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UISortable.styles.cssText || String(UISortable.styles)
		assert.ok(css.includes('--ui-sortable-'), 'missing --ui-sortable- custom properties')
	})

	it('has prototype methods for drag and drop', () => {
		assert.equal(typeof UISortable.prototype._onDragStart, 'function')
		assert.equal(typeof UISortable.prototype._onDragOver, 'function')
		assert.equal(typeof UISortable.prototype._onDragLeave, 'function')
		assert.equal(typeof UISortable.prototype._onDrop, 'function')
		assert.equal(typeof UISortable.prototype._onDragEnd, 'function')
		assert.equal(typeof UISortable.prototype._getLabel, 'function')
		assert.equal(typeof UISortable.prototype.render, 'function')
	})
})
