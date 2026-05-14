import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UICodeBlock from '../code-block.js'

describe('ui-code-block', () => {
	it('exports UICodeBlock class', () => {
		assert.ok(UICodeBlock)
		assert.equal(typeof UICodeBlock, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UICodeBlock.properties)
		assert.ok(UICodeBlock.properties.title)
		assert.ok(UICodeBlock.properties.lang)
		assert.ok(UICodeBlock.properties.code)
		assert.equal(UICodeBlock.properties.title.type, String)
		assert.equal(UICodeBlock.properties.lang.type, String)
		assert.equal(UICodeBlock.properties.code.type, String)
	})

	it('defines CSS styles', () => {
		assert.ok(UICodeBlock.styles)
		const css = UICodeBlock.styles.cssText || String(UICodeBlock.styles)
		assert.ok(css.includes('font-family'))
		assert.ok(css.includes('overflow-x'))
	})

	it('CSS includes traffic-light dots', () => {
		const css = UICodeBlock.styles.cssText || String(UICodeBlock.styles)
		assert.ok(css.includes('.dot'))
		assert.ok(css.includes('.red'))
		assert.ok(css.includes('.yellow'))
		assert.ok(css.includes('.green'))
	})

	it('CSS includes header and pre styling', () => {
		const css = UICodeBlock.styles.cssText || String(UICodeBlock.styles)
		assert.ok(css.includes('.header'))
		assert.ok(css.includes('pre'))
	})
})
