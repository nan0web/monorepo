import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIProgressBar from '../progress.js'

describe('ui-progress', () => {
	it('exports UIProgressBar class', () => {
		assert.ok(UIProgressBar)
		assert.equal(typeof UIProgressBar, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIProgressBar.properties)
		assert.ok(UIProgressBar.properties.value)
		assert.ok(UIProgressBar.properties.max)
		assert.ok(UIProgressBar.properties.indeterminate)
		assert.ok(UIProgressBar.properties.showLabel)
		assert.ok(UIProgressBar.properties.size)
		assert.equal(UIProgressBar.properties.value.type, Number)
		assert.equal(UIProgressBar.properties.max.type, Number)
		assert.equal(UIProgressBar.properties.indeterminate.type, Boolean)
	})

	it('indeterminate and size reflect to attribute', () => {
		assert.equal(UIProgressBar.properties.indeterminate.reflect, true)
		assert.equal(UIProgressBar.properties.size.reflect, true)
	})

	it('showLabel has attribute mapping', () => {
		assert.equal(UIProgressBar.properties.showLabel.attribute, 'show-label')
	})

	it('defines CSS styles with track and fill', () => {
		assert.ok(UIProgressBar.styles)
		const css = UIProgressBar.styles.cssText || String(UIProgressBar.styles)
		assert.ok(css.includes('.track'), 'missing .track')
		assert.ok(css.includes('.fill'), 'missing .fill')
	})

	it('CSS includes indeterminate animation', () => {
		const css = UIProgressBar.styles.cssText || String(UIProgressBar.styles)
		assert.ok(css.includes('indeterminate'), 'missing indeterminate animation')
	})

	it('CSS includes shimmer effect', () => {
		const css = UIProgressBar.styles.cssText || String(UIProgressBar.styles)
		assert.ok(css.includes('progress-shimmer'), 'missing shimmer')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIProgressBar.styles.cssText || String(UIProgressBar.styles)
		assert.ok(css.includes('--ui-progress-'), 'missing --ui-progress- custom properties')
	})

	it('has _percent getter', () => {
		const desc = Object.getOwnPropertyDescriptor(UIProgressBar.prototype, '_percent')
		assert.ok(desc, '_percent getter must exist')
		assert.equal(typeof desc.get, 'function')
	})

	it('has prototype method render', () => {
		assert.equal(typeof UIProgressBar.prototype.render, 'function')
	})
})
