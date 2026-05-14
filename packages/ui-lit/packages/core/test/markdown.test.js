import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIMarkdown from '../markdown.js'

describe('ui-markdown', () => {
	it('exports UIMarkdown class', () => {
		assert.ok(UIMarkdown)
		assert.equal(typeof UIMarkdown, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIMarkdown.properties)
		assert.ok(UIMarkdown.properties.content)
		assert.equal(UIMarkdown.properties.content.type, String)
	})

	it('defines comprehensive typography (h1—h4)', () => {
		assert.ok(UIMarkdown.styles)
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('.prose h1'), 'missing h1')
		assert.ok(css.includes('.prose h2'), 'missing h2')
		assert.ok(css.includes('.prose h3'), 'missing h3')
		assert.ok(css.includes('.prose h4'), 'missing h4')
	})

	it('uses clamp() for fluid typography per system.md', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('clamp('), 'missing clamp() for fluid typography')
	})

	it('styles links (anchors)', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('.prose a'), 'missing link styles')
	})

	it('styles inline code and code blocks', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('.prose code'), 'missing inline code')
		assert.ok(css.includes('.prose pre'), 'missing code block pre')
		assert.ok(css.includes('.prose pre code'), 'missing pre > code')
	})

	it('styles blockquotes with accent border', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('.prose blockquote'), 'missing blockquote')
		assert.ok(css.includes('border-left'), 'blockquote needs left border')
	})

	it('styles tables (th, td)', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('.prose table'), 'missing table')
		assert.ok(css.includes('.prose th'), 'missing th')
		assert.ok(css.includes('.prose td'), 'missing td')
	})

	it('styles lists (ul, ol)', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('.prose ul'), 'missing ul')
		assert.ok(css.includes('.prose ol'), 'missing ol')
		assert.ok(css.includes('.prose li'), 'missing li')
	})

	it('styles horizontal rule', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('.prose hr'), 'missing hr')
	})

	it('styles images with responsive width', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('.prose img'), 'missing img')
		assert.ok(css.includes('max-width'), 'img needs max-width')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIMarkdown.styles.cssText || String(UIMarkdown.styles)
		assert.ok(css.includes('--ui-md-'), 'missing --ui-md- custom properties')
	})

	it('has render method', () => {
		assert.equal(typeof UIMarkdown.prototype.render, 'function')
	})
})
