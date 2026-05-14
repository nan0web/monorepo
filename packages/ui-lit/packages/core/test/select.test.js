import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UISelect from '../select.js'

describe('ui-select', () => {
	it('exports UISelect class', () => {
		assert.ok(UISelect)
		assert.equal(typeof UISelect, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UISelect.properties)
		assert.ok(UISelect.properties.label)
		assert.ok(UISelect.properties.placeholder)
		assert.ok(UISelect.properties.value)
		assert.ok(UISelect.properties.disabled)
		assert.ok(UISelect.properties.options)
		assert.equal(UISelect.properties.label.type, String)
		assert.equal(UISelect.properties.value.type, String)
		assert.equal(UISelect.properties.options.type, Array)
	})

	it('disabled reflects to attribute', () => {
		assert.equal(UISelect.properties.disabled.reflect, true)
	})

	it('defines CSS styles', () => {
		assert.ok(UISelect.styles)
		const css = UISelect.styles.cssText || String(UISelect.styles)
		assert.ok(css.includes('dropdown'), 'missing dropdown')
		assert.ok(css.includes('trigger'), 'missing trigger')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UISelect.styles.cssText || String(UISelect.styles)
		assert.ok(css.includes('--ui-select-'), 'missing --ui-select- custom properties')
	})

	it('CSS includes animation', () => {
		const css = UISelect.styles.cssText || String(UISelect.styles)
		assert.ok(css.includes('animation'), 'missing dropdown animation')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UISelect.prototype._toggle, 'function')
		assert.equal(typeof UISelect.prototype._selectOption, 'function')
		assert.equal(typeof UISelect.prototype._onKeyDown, 'function')
		assert.equal(typeof UISelect.prototype.render, 'function')
	})

	it('has _selectedLabel getter', () => {
		const desc = Object.getOwnPropertyDescriptor(UISelect.prototype, '_selectedLabel')
		assert.ok(desc, '_selectedLabel getter must exist')
		assert.equal(typeof desc.get, 'function')
	})
})
