import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIAccordion from '../accordion.js'

describe('ui-accordion', () => {
	it('exports UIAccordion class', () => {
		assert.ok(UIAccordion)
		assert.equal(typeof UIAccordion, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIAccordion.properties)
		assert.ok(UIAccordion.properties.items)
		assert.ok(UIAccordion.properties.multiple)
		assert.equal(UIAccordion.properties.items.type, Array)
		assert.equal(UIAccordion.properties.multiple.type, Boolean)
	})

	it('defines CSS styles with accordion structure', () => {
		assert.ok(UIAccordion.styles)
		const css = UIAccordion.styles.cssText || String(UIAccordion.styles)
		assert.ok(css.includes('.accordion'), 'missing .accordion')
		assert.ok(css.includes('.section'), 'missing .section')
		assert.ok(css.includes('.header'), 'missing .header')
		assert.ok(css.includes('.panel'), 'missing .panel')
	})

	it('CSS includes chevron rotation animation', () => {
		const css = UIAccordion.styles.cssText || String(UIAccordion.styles)
		assert.ok(css.includes('.chevron'), 'missing .chevron')
		assert.ok(css.includes('rotate'), 'missing rotate transform')
	})

	it('CSS includes panel expand transition', () => {
		const css = UIAccordion.styles.cssText || String(UIAccordion.styles)
		assert.ok(css.includes('max-height'), 'missing max-height for expand')
		assert.ok(css.includes('transition'), 'missing transition')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIAccordion.styles.cssText || String(UIAccordion.styles)
		assert.ok(css.includes('--ui-accordion-'), 'missing --ui-accordion- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIAccordion.prototype._toggle, 'function')
		assert.equal(typeof UIAccordion.prototype.render, 'function')
	})
})
