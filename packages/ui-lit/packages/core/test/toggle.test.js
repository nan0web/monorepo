import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIToggle from '../toggle.js'

describe('ui-toggle', () => {
	it('exports UIToggle class', () => {
		assert.ok(UIToggle)
		assert.equal(typeof UIToggle, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIToggle.properties)
		assert.ok(UIToggle.properties.label)
		assert.ok(UIToggle.properties.checked)
		assert.ok(UIToggle.properties.disabled)
		assert.equal(UIToggle.properties.label.type, String)
		assert.equal(UIToggle.properties.checked.type, Boolean)
		assert.equal(UIToggle.properties.disabled.type, Boolean)
	})

	it('checked and disabled reflect to attribute', () => {
		assert.equal(UIToggle.properties.checked.reflect, true)
		assert.equal(UIToggle.properties.disabled.reflect, true)
	})

	it('defines CSS styles with track and thumb', () => {
		assert.ok(UIToggle.styles)
		const css = UIToggle.styles.cssText || String(UIToggle.styles)
		assert.ok(css.includes('.track'), 'missing .track')
		assert.ok(css.includes('.thumb'), 'missing .thumb')
	})

	it('CSS includes transition for smooth animation', () => {
		const css = UIToggle.styles.cssText || String(UIToggle.styles)
		assert.ok(css.includes('transition'), 'missing transition')
		assert.ok(css.includes('translateX'), 'missing translateX for thumb movement')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIToggle.styles.cssText || String(UIToggle.styles)
		assert.ok(css.includes('--ui-toggle-'), 'missing --ui-toggle- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIToggle.prototype._toggle, 'function')
		assert.equal(typeof UIToggle.prototype.render, 'function')
	})
})
