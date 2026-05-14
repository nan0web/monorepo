import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIAutocomplete from '../autocomplete.js'

describe('ui-autocomplete', () => {
	it('exports UIAutocomplete class', () => {
		assert.ok(UIAutocomplete)
		assert.equal(typeof UIAutocomplete, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIAutocomplete.properties)
		assert.ok(UIAutocomplete.properties.label)
		assert.ok(UIAutocomplete.properties.placeholder)
		assert.ok(UIAutocomplete.properties.value)
		assert.ok(UIAutocomplete.properties.disabled)
		assert.ok(UIAutocomplete.properties.options)
		assert.equal(UIAutocomplete.properties.label.type, String)
		assert.equal(UIAutocomplete.properties.value.type, String)
		assert.equal(UIAutocomplete.properties.options.type, Array)
	})

	it('disabled reflects to attribute', () => {
		assert.equal(UIAutocomplete.properties.disabled.reflect, true)
	})

	it('defines CSS styles with dropdown and options', () => {
		assert.ok(UIAutocomplete.styles)
		const css = UIAutocomplete.styles.cssText || String(UIAutocomplete.styles)
		assert.ok(css.includes('.dropdown'), 'missing .dropdown')
		assert.ok(css.includes('.option'), 'missing .option')
		assert.ok(css.includes('.no-results'), 'missing .no-results')
	})

	it('CSS includes active/highlight states', () => {
		const css = UIAutocomplete.styles.cssText || String(UIAutocomplete.styles)
		assert.ok(css.includes('.active'), 'missing .active state')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIAutocomplete.styles.cssText || String(UIAutocomplete.styles)
		assert.ok(css.includes('--ui-auto-'), 'missing --ui-auto- custom properties')
	})

	it('has _filtered getter for search', () => {
		const desc = Object.getOwnPropertyDescriptor(UIAutocomplete.prototype, '_filtered')
		assert.ok(desc, '_filtered getter must exist')
		assert.equal(typeof desc.get, 'function')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIAutocomplete.prototype._onInput, 'function')
		assert.equal(typeof UIAutocomplete.prototype._select, 'function')
		assert.equal(typeof UIAutocomplete.prototype._onKeyDown, 'function')
		assert.equal(typeof UIAutocomplete.prototype._getLabel, 'function')
		assert.equal(typeof UIAutocomplete.prototype._getValue, 'function')
		assert.equal(typeof UIAutocomplete.prototype.render, 'function')
	})
})
