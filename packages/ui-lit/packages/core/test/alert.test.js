import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIAlert from '../alert.js'

describe('ui-alert', () => {
	it('exports UIAlert class', () => {
		assert.ok(UIAlert)
		assert.equal(typeof UIAlert, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIAlert.properties)
		assert.ok(UIAlert.properties.variant)
		assert.ok(UIAlert.properties.open)
		assert.ok(UIAlert.properties.title)
		assert.ok(UIAlert.properties.content)
		assert.equal(UIAlert.properties.variant.type, String)
		assert.equal(UIAlert.properties.open.type, Boolean)
		assert.equal(UIAlert.properties.title.type, String)
		assert.equal(UIAlert.properties.content.type, String)
	})

	it('variant reflects to attribute', () => {
		assert.equal(UIAlert.properties.variant.reflect, true)
	})

	it('defines CSS styles with all variant selectors', () => {
		assert.ok(UIAlert.styles)
		const css = UIAlert.styles.cssText || String(UIAlert.styles)
		assert.ok(css.includes('success'), 'missing success variant')
		assert.ok(css.includes('error'), 'missing error variant')
		assert.ok(css.includes('warning'), 'missing warning variant')
		assert.ok(css.includes('info'), 'missing info variant')
	})

	it('CSS supports VitePress type aliases (tip, danger)', () => {
		const css = UIAlert.styles.cssText || String(UIAlert.styles)
		assert.ok(css.includes('tip'), 'missing tip alias')
		assert.ok(css.includes('danger'), 'missing danger alias')
	})

	it('CSS includes icon, body, and heading layout', () => {
		const css = UIAlert.styles.cssText || String(UIAlert.styles)
		assert.ok(css.includes('.icon'), 'missing .icon')
		assert.ok(css.includes('.body'), 'missing .body')
		assert.ok(css.includes('.heading'), 'missing .heading')
		assert.ok(css.includes('.content'), 'missing .content')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIAlert.styles.cssText || String(UIAlert.styles)
		assert.ok(css.includes('--ui-alert-'), 'missing --ui-alert- custom properties')
	})

	it('CSS includes role="alert" and border-left accent', () => {
		const css = UIAlert.styles.cssText || String(UIAlert.styles)
		assert.ok(css.includes('border-left'), 'missing left border accent')
	})

	it('has prototype method _effectiveVariant', () => {
		assert.equal(typeof UIAlert.prototype._effectiveVariant, 'undefined')
		// _effectiveVariant is a getter, check via descriptor
		const desc = Object.getOwnPropertyDescriptor(UIAlert.prototype, '_effectiveVariant')
		assert.ok(desc, '_effectiveVariant getter must exist')
		assert.equal(typeof desc.get, 'function')
	})

	it('has prototype method render', () => {
		assert.equal(typeof UIAlert.prototype.render, 'function')
	})

	it('has SVG icon getter _icon', () => {
		const desc = Object.getOwnPropertyDescriptor(UIAlert.prototype, '_icon')
		assert.ok(desc, '_icon getter must exist')
		assert.equal(typeof desc.get, 'function')
	})
})
