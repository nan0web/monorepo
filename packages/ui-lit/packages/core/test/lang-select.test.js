import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UILangSelect from '../lang-select.js'

describe('ui-lang-select', () => {
	it('exports UILangSelect class', () => {
		assert.ok(UILangSelect)
		assert.equal(typeof UILangSelect, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UILangSelect.properties)
		assert.ok(UILangSelect.properties.locale)
		assert.ok(UILangSelect.properties.langs)
		assert.equal(UILangSelect.properties.locale.type, String)
		assert.equal(UILangSelect.properties.locale.reflect, true)
		assert.equal(UILangSelect.properties.langs.type, Array)
	})

	it('has private _open state property', () => {
		assert.ok(UILangSelect.properties._open)
		assert.equal(UILangSelect.properties._open.type, Boolean)
		assert.equal(UILangSelect.properties._open.state, true)
	})

	it('defines CSS styles with menu and animation', () => {
		assert.ok(UILangSelect.styles)
		const css = UILangSelect.styles.cssText || String(UILangSelect.styles)
		assert.ok(css.includes('.menu'), 'missing .menu styles')
		assert.ok(css.includes('.menu-item'), 'missing .menu-item styles')
		assert.ok(css.includes('animation'), 'missing animation')
	})

	it('CSS includes chevron indicator', () => {
		const css = UILangSelect.styles.cssText || String(UILangSelect.styles)
		assert.ok(css.includes('.chevron'), 'missing .chevron')
	})

	it('CSS includes accessible aria-selected styling', () => {
		const css = UILangSelect.styles.cssText || String(UILangSelect.styles)
		assert.ok(css.includes('aria-selected'), 'missing aria-selected')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UILangSelect.styles.cssText || String(UILangSelect.styles)
		assert.ok(css.includes('--ui-lang-'), 'missing --ui-lang- custom properties')
	})

	it('CSS includes focus-visible for accessibility', () => {
		const css = UILangSelect.styles.cssText || String(UILangSelect.styles)
		assert.ok(css.includes('focus-visible'), 'missing focus-visible')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UILangSelect.prototype.render, 'function')
		assert.equal(typeof UILangSelect.prototype._toggleMenu, 'function')
		assert.equal(typeof UILangSelect.prototype._selectLang, 'function')
		assert.equal(typeof UILangSelect.prototype._onKeyDown, 'function')
		assert.equal(typeof UILangSelect.prototype._loadLocale, 'function')
	})

	it('has _currentLang getter', () => {
		const desc = Object.getOwnPropertyDescriptor(UILangSelect.prototype, '_currentLang')
		assert.ok(desc, '_currentLang getter must exist')
		assert.equal(typeof desc.get, 'function')
	})
})
