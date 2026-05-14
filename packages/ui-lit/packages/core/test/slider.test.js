import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UISlider from '../slider.js'

describe('ui-slider', () => {
	it('exports UISlider class', () => {
		assert.ok(UISlider)
		assert.equal(typeof UISlider, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UISlider.properties)
		assert.ok(UISlider.properties.label)
		assert.ok(UISlider.properties.value)
		assert.ok(UISlider.properties.min)
		assert.ok(UISlider.properties.max)
		assert.ok(UISlider.properties.step)
		assert.ok(UISlider.properties.showValue)
		assert.ok(UISlider.properties.disabled)
		assert.equal(UISlider.properties.value.type, Number)
		assert.equal(UISlider.properties.min.type, Number)
		assert.equal(UISlider.properties.max.type, Number)
		assert.equal(UISlider.properties.step.type, Number)
	})

	it('disabled reflects to attribute', () => {
		assert.equal(UISlider.properties.disabled.reflect, true)
	})

	it('showValue has attribute mapping', () => {
		assert.equal(UISlider.properties.showValue.attribute, 'show-value')
	})

	it('defines CSS styles with range input styling', () => {
		assert.ok(UISlider.styles)
		const css = UISlider.styles.cssText || String(UISlider.styles)
		assert.ok(css.includes("input[type='range']"), 'missing range input styling')
		assert.ok(css.includes('-webkit-slider-thumb'), 'missing webkit thumb')
	})

	it('CSS includes grab cursor for thumb', () => {
		const css = UISlider.styles.cssText || String(UISlider.styles)
		assert.ok(css.includes('grab'), 'missing grab cursor')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UISlider.styles.cssText || String(UISlider.styles)
		assert.ok(css.includes('--ui-slider-'), 'missing --ui-slider- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UISlider.prototype._onInput, 'function')
		assert.equal(typeof UISlider.prototype.render, 'function')
	})
})
