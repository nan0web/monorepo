import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIInput from '../input.js'

describe('ui-input', () => {
	it('exports UIInput class', () => {
		assert.ok(UIInput)
		assert.equal(typeof UIInput, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIInput.properties)
		assert.ok(UIInput.properties.label)
		assert.ok(UIInput.properties.placeholder)
		assert.ok(UIInput.properties.value)
		assert.ok(UIInput.properties.type)
		assert.ok(UIInput.properties.disabled)
		assert.ok(UIInput.properties.required)
		assert.ok(UIInput.properties.state)
		assert.ok(UIInput.properties.hint)
		assert.equal(UIInput.properties.label.type, String)
		assert.equal(UIInput.properties.value.type, String)
		assert.equal(UIInput.properties.disabled.type, Boolean)
		assert.equal(UIInput.properties.state.type, String)
	})

	it('disabled and state reflect to attribute', () => {
		assert.equal(UIInput.properties.disabled.reflect, true)
		assert.equal(UIInput.properties.state.reflect, true)
	})

	it('defines CSS styles with validation states', () => {
		assert.ok(UIInput.styles)
		const css = UIInput.styles.cssText || String(UIInput.styles)
		assert.ok(css.includes('error'), 'missing error state')
		assert.ok(css.includes('success'), 'missing success state')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIInput.styles.cssText || String(UIInput.styles)
		assert.ok(css.includes('--ui-input-'), 'missing --ui-input- custom properties')
	})

	it('CSS includes focus ring styling', () => {
		const css = UIInput.styles.cssText || String(UIInput.styles)
		assert.ok(css.includes('box-shadow'), 'missing focus box-shadow')
	})

	it('has prototype method _onInput', () => {
		assert.equal(typeof UIInput.prototype._onInput, 'function')
	})

	it('has prototype method render', () => {
		assert.equal(typeof UIInput.prototype.render, 'function')
	})
})
