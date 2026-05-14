import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIThemeToggle from '../theme-toggle.js'

describe('ui-theme-toggle', () => {
	it('exports UIThemeToggle class', () => {
		assert.ok(UIThemeToggle)
		assert.equal(typeof UIThemeToggle, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIThemeToggle.properties)
		assert.ok(UIThemeToggle.properties.theme)
		assert.equal(UIThemeToggle.properties.theme.type, String)
	})

	it('theme reflects to attribute', () => {
		assert.equal(UIThemeToggle.properties.theme.reflect, true)
	})

	it('defines CSS styles with button and hover', () => {
		assert.ok(UIThemeToggle.styles)
		const css = UIThemeToggle.styles.cssText || String(UIThemeToggle.styles)
		assert.ok(css.includes('button'), 'missing button styles')
		assert.ok(css.includes('cursor'), 'missing cursor pointer')
	})

	it('CSS includes focus-visible for accessibility', () => {
		const css = UIThemeToggle.styles.cssText || String(UIThemeToggle.styles)
		assert.ok(css.includes('focus-visible'), 'missing focus-visible')
	})

	it('CSS includes SVG sizing', () => {
		const css = UIThemeToggle.styles.cssText || String(UIThemeToggle.styles)
		assert.ok(css.includes('svg'), 'missing svg styles')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIThemeToggle.styles.cssText || String(UIThemeToggle.styles)
		assert.ok(css.includes('--ui-toggle-'), 'missing --ui-toggle- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIThemeToggle.prototype.render, 'function')
		assert.equal(typeof UIThemeToggle.prototype._toggle, 'function')
		assert.equal(typeof UIThemeToggle.prototype._loadTheme, 'function')
		assert.equal(typeof UIThemeToggle.prototype._applyTheme, 'function')
	})

	it('has SVG icon getters for sun and moon', () => {
		const sunDesc = Object.getOwnPropertyDescriptor(UIThemeToggle.prototype, '_sunIcon')
		const moonDesc = Object.getOwnPropertyDescriptor(UIThemeToggle.prototype, '_moonIcon')
		assert.ok(sunDesc, '_sunIcon getter must exist')
		assert.ok(moonDesc, '_moonIcon getter must exist')
		assert.equal(typeof sunDesc.get, 'function')
		assert.equal(typeof moonDesc.get, 'function')
	})
})
