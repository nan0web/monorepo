import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIPage from '../page.js'

describe('ui-page', () => {
	it('exports UIPage class', () => {
		assert.ok(UIPage)
		assert.equal(typeof UIPage, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIPage.properties)
		assert.ok(UIPage.properties.title)
		assert.equal(UIPage.properties.title.type, String)
	})

	it('defines CSS styles with layout structure', () => {
		assert.ok(UIPage.styles)
		const css = UIPage.styles.cssText || String(UIPage.styles)
		assert.ok(css.includes('.layout'), 'missing .layout')
		assert.ok(css.includes('.sidebar-area'), 'missing .sidebar-area')
		assert.ok(css.includes('.content-area'), 'missing .content-area')
		assert.ok(css.includes('.footer-area'), 'missing .footer-area')
	})

	it('CSS includes responsive mobile sidebar', () => {
		const css = UIPage.styles.cssText || String(UIPage.styles)
		assert.ok(css.includes('@media'), 'missing media query')
		assert.ok(css.includes('.sidebar-toggle'), 'missing sidebar toggle')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIPage.styles.cssText || String(UIPage.styles)
		assert.ok(css.includes('--ui-page-'), 'missing --ui-page- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIPage.prototype._toggleSidebar, 'function')
		assert.equal(typeof UIPage.prototype.render, 'function')
	})
})
