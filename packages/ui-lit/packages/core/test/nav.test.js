import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UINav from '../nav.js'

describe('ui-nav', () => {
	it('exports UINav class', () => {
		assert.ok(UINav)
		assert.equal(typeof UINav, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UINav.properties)
		assert.ok(UINav.properties.brand)
		assert.ok(UINav.properties.items)
		assert.equal(UINav.properties.brand.type, Object)
		assert.equal(UINav.properties.items.type, Array)
	})

	it('has private _menuOpen state property', () => {
		assert.ok(UINav.properties._menuOpen)
		assert.equal(UINav.properties._menuOpen.state, true)
	})

	it('CSS includes sticky positioning per system.md', () => {
		assert.ok(UINav.styles)
		const css = UINav.styles.cssText || String(UINav.styles)
		assert.ok(css.includes('sticky'), 'must be position: sticky')
		assert.ok(css.includes('z-index'), 'must have z-index')
	})

	it('CSS includes glassmorphism backdrop-filter per system.md', () => {
		const css = UINav.styles.cssText || String(UINav.styles)
		assert.ok(css.includes('backdrop-filter'), 'must have backdrop-filter')
		assert.ok(css.includes('blur'), 'must include blur()')
		assert.ok(css.includes('saturate'), 'must include saturate()')
	})

	it('CSS includes responsive hamburger button', () => {
		const css = UINav.styles.cssText || String(UINav.styles)
		assert.ok(css.includes('.hamburger'), 'missing .hamburger')
		assert.ok(css.includes('768px'), 'missing responsive breakpoint')
	})

	it('CSS includes mobile menu overlay', () => {
		const css = UINav.styles.cssText || String(UINav.styles)
		assert.ok(css.includes('.mobile-menu'), 'missing .mobile-menu')
	})

	it('CSS includes brand styling', () => {
		const css = UINav.styles.cssText || String(UINav.styles)
		assert.ok(css.includes('.brand'), 'missing .brand')
	})

	it('CSS includes link hover states', () => {
		const css = UINav.styles.cssText || String(UINav.styles)
		assert.ok(css.includes('.links a'), 'missing .links a')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UINav.styles.cssText || String(UINav.styles)
		assert.ok(css.includes('--ui-nav-'), 'missing --ui-nav- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UINav.prototype.render, 'function')
		assert.equal(typeof UINav.prototype._toggleMenu, 'function')
		assert.equal(typeof UINav.prototype._renderLink, 'function')
	})
})
