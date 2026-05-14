import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UISpinner from '../spinner.js'

describe('ui-spinner', () => {
	it('exports UISpinner class', () => {
		assert.ok(UISpinner)
		assert.equal(typeof UISpinner, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UISpinner.properties)
		assert.ok(UISpinner.properties.variant)
		assert.ok(UISpinner.properties.size)
		assert.ok(UISpinner.properties.label)
		assert.equal(UISpinner.properties.variant.type, String)
		assert.equal(UISpinner.properties.size.type, String)
		assert.equal(UISpinner.properties.label.type, String)
	})

	it('variant and size reflect to attribute', () => {
		assert.equal(UISpinner.properties.variant.reflect, true)
		assert.equal(UISpinner.properties.size.reflect, true)
	})

	it('defines CSS styles with all animation variants', () => {
		assert.ok(UISpinner.styles)
		const css = UISpinner.styles.cssText || String(UISpinner.styles)
		assert.ok(css.includes('.ring'), 'missing .ring')
		assert.ok(css.includes('.dots'), 'missing .dots')
		assert.ok(css.includes('.pulse'), 'missing .pulse')
	})

	it('CSS includes spin animation', () => {
		const css = UISpinner.styles.cssText || String(UISpinner.styles)
		assert.ok(css.includes('spin'), 'missing spin keyframe')
	})

	it('CSS supports size variants', () => {
		const css = UISpinner.styles.cssText || String(UISpinner.styles)
		assert.ok(css.includes("size='sm'"), 'missing sm size')
		assert.ok(css.includes("size='lg'"), 'missing lg size')
	})

	it('CSS includes screen reader text', () => {
		const css = UISpinner.styles.cssText || String(UISpinner.styles)
		assert.ok(css.includes('.sr-only'), 'missing .sr-only')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UISpinner.styles.cssText || String(UISpinner.styles)
		assert.ok(css.includes('--ui-spinner-'), 'missing --ui-spinner- custom properties')
	})

	it('has prototype method render', () => {
		assert.equal(typeof UISpinner.prototype.render, 'function')
	})
})
