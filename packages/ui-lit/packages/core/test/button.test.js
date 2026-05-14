import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIButton from '../button.js'

describe('ui-button', () => {
	it('exports UIButton class', () => {
		assert.ok(UIButton)
		assert.equal(typeof UIButton, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIButton.properties)
		assert.ok(UIButton.properties.label)
		assert.ok(UIButton.properties.variant)
		assert.ok(UIButton.properties.size)
		assert.ok(UIButton.properties.disabled)
		assert.ok(UIButton.properties.loading)
		assert.equal(UIButton.properties.label.type, String)
		assert.equal(UIButton.properties.variant.type, String)
		assert.equal(UIButton.properties.disabled.type, Boolean)
		assert.equal(UIButton.properties.loading.type, Boolean)
	})

	it('variant, size, disabled, loading reflect to attribute', () => {
		assert.equal(UIButton.properties.variant.reflect, true)
		assert.equal(UIButton.properties.size.reflect, true)
		assert.equal(UIButton.properties.disabled.reflect, true)
		assert.equal(UIButton.properties.loading.reflect, true)
	})

	it('defines CSS styles with all variants', () => {
		assert.ok(UIButton.styles)
		const css = UIButton.styles.cssText || String(UIButton.styles)
		const variants = ['primary', 'secondary', 'danger', 'ghost', 'outline']
		for (const v of variants) {
			assert.ok(css.includes(v), `CSS should contain variant "${v}"`)
		}
	})

	it('CSS includes size variants', () => {
		const css = UIButton.styles.cssText || String(UIButton.styles)
		assert.ok(css.includes("size='sm'"), 'missing sm size')
		assert.ok(css.includes("size='lg'"), 'missing lg size')
	})

	it('CSS includes spinner animation', () => {
		const css = UIButton.styles.cssText || String(UIButton.styles)
		assert.ok(css.includes('spinner'), 'missing spinner class')
		assert.ok(css.includes('btn-spin'), 'missing btn-spin keyframe')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIButton.styles.cssText || String(UIButton.styles)
		assert.ok(css.includes('--ui-btn-'), 'missing --ui-btn- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIButton.prototype._onClick, 'function')
		assert.equal(typeof UIButton.prototype.render, 'function')
	})
})
