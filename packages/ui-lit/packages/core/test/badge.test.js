import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIBadge from '../badge.js'

describe('ui-badge', () => {
	it('exports UIBadge class', () => {
		assert.ok(UIBadge)
		assert.equal(typeof UIBadge, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIBadge.properties)
		assert.ok(UIBadge.properties.label)
		assert.ok(UIBadge.properties.variant)
		assert.equal(UIBadge.properties.label.type, String)
		assert.equal(UIBadge.properties.variant.type, String)
	})

	it('variant reflects to attribute', () => {
		assert.equal(UIBadge.properties.variant.reflect, true)
	})

	it('defines CSS styles', () => {
		assert.ok(UIBadge.styles)
		const css = UIBadge.styles.cssText || String(UIBadge.styles)
		assert.ok(css.includes('border-radius'))
		assert.ok(css.includes('font-family'))
	})

	it('supports named variants in CSS', () => {
		const css = UIBadge.styles.cssText || String(UIBadge.styles)
		// neutral is the default (no variant attr), so only named variants have explicit selectors
		const variants = ['primary', 'secondary', 'info', 'ok', 'warn', 'err']
		for (const v of variants) {
			assert.ok(css.includes(v), `CSS should contain variant "${v}"`)
		}
	})
})
