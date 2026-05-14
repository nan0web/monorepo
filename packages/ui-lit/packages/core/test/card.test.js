import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UICard from '../card.js'

describe('ui-card', () => {
	it('exports UICard class', () => {
		assert.ok(UICard)
		assert.equal(typeof UICard, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UICard.properties)
		assert.ok(UICard.properties.title)
		assert.ok(UICard.properties.subtitle)
		assert.ok(UICard.properties.image)
		assert.ok(UICard.properties.hoverable)
		assert.equal(UICard.properties.title.type, String)
		assert.equal(UICard.properties.subtitle.type, String)
		assert.equal(UICard.properties.image.type, String)
		assert.equal(UICard.properties.hoverable.type, Boolean)
	})

	it('hoverable reflects to attribute', () => {
		assert.equal(UICard.properties.hoverable.reflect, true)
	})

	it('defines CSS styles with card structure', () => {
		assert.ok(UICard.styles)
		const css = UICard.styles.cssText || String(UICard.styles)
		assert.ok(css.includes('.card'), 'missing .card')
		assert.ok(css.includes('.card-header'), 'missing .card-header')
		assert.ok(css.includes('.card-body'), 'missing .card-body')
		assert.ok(css.includes('.card-image'), 'missing .card-image')
	})

	it('CSS includes hover effect for hoverable', () => {
		const css = UICard.styles.cssText || String(UICard.styles)
		assert.ok(css.includes('hoverable'), 'missing hoverable styles')
		assert.ok(css.includes('translateY'), 'missing hover lift transform')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UICard.styles.cssText || String(UICard.styles)
		assert.ok(css.includes('--ui-card-'), 'missing --ui-card- custom properties')
	})

	it('has prototype method render', () => {
		assert.equal(typeof UICard.prototype.render, 'function')
	})
})
