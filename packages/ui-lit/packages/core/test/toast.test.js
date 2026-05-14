import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIToast from '../toast.js'

describe('ui-toast', () => {
	it('exports UIToast class', () => {
		assert.ok(UIToast)
		assert.equal(typeof UIToast, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIToast.properties)
		assert.ok(UIToast.properties.message)
		assert.ok(UIToast.properties.variant)
		assert.ok(UIToast.properties.duration)
		assert.ok(UIToast.properties.open)
		assert.ok(UIToast.properties.closable)
		assert.equal(UIToast.properties.message.type, String)
		assert.equal(UIToast.properties.variant.type, String)
		assert.equal(UIToast.properties.duration.type, Number)
		assert.equal(UIToast.properties.open.type, Boolean)
	})

	it('variant and open reflect to attribute', () => {
		assert.equal(UIToast.properties.variant.reflect, true)
		assert.equal(UIToast.properties.open.reflect, true)
	})

	it('defines CSS styles with toast and variants', () => {
		assert.ok(UIToast.styles)
		const css = UIToast.styles.cssText || String(UIToast.styles)
		assert.ok(css.includes('.toast'), 'missing .toast')
		assert.ok(css.includes('success'), 'missing success variant')
		assert.ok(css.includes('warning'), 'missing warning variant')
		assert.ok(css.includes('error'), 'missing error variant')
	})

	it('CSS includes slide-in animation', () => {
		const css = UIToast.styles.cssText || String(UIToast.styles)
		assert.ok(css.includes('toast-in'), 'missing toast-in animation')
	})

	it('CSS includes progress bar', () => {
		const css = UIToast.styles.cssText || String(UIToast.styles)
		assert.ok(css.includes('.progress'), 'missing .progress')
		assert.ok(css.includes('toast-progress'), 'missing toast-progress animation')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIToast.styles.cssText || String(UIToast.styles)
		assert.ok(css.includes('--ui-toast-'), 'missing --ui-toast- custom properties')
	})

	it('has SVG icon getter _icon', () => {
		const desc = Object.getOwnPropertyDescriptor(UIToast.prototype, '_icon')
		assert.ok(desc, '_icon getter must exist')
		assert.equal(typeof desc.get, 'function')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIToast.prototype._close, 'function')
		assert.equal(typeof UIToast.prototype._startTimer, 'function')
		assert.equal(typeof UIToast.prototype.render, 'function')
	})
})
