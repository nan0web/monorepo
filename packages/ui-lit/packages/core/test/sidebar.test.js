import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UISidebar from '../sidebar.js'

describe('ui-sidebar', () => {
	it('exports UISidebar class', () => {
		assert.ok(UISidebar)
		assert.equal(typeof UISidebar, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UISidebar.properties)
		assert.ok(UISidebar.properties.title)
		assert.ok(UISidebar.properties.items)
		assert.equal(UISidebar.properties.title.type, String)
		assert.equal(UISidebar.properties.items.type, Array)
	})

	it('CSS defines sidebar layout with overflow', () => {
		assert.ok(UISidebar.styles)
		const css = UISidebar.styles.cssText || String(UISidebar.styles)
		assert.ok(css.includes('.sidebar'), 'missing .sidebar')
		assert.ok(css.includes('overflow-y'), 'missing overflow-y for scrollable content')
	})

	it('CSS includes sidebar width via custom property', () => {
		const css = UISidebar.styles.cssText || String(UISidebar.styles)
		assert.ok(css.includes('--ui-sidebar-width'), 'missing --ui-sidebar-width')
	})

	it('CSS includes group labels', () => {
		const css = UISidebar.styles.cssText || String(UISidebar.styles)
		assert.ok(css.includes('.group-label'), 'missing .group-label')
		assert.ok(css.includes('text-transform'), 'group label should be uppercase')
	})

	it('CSS includes children indentation with border', () => {
		const css = UISidebar.styles.cssText || String(UISidebar.styles)
		assert.ok(css.includes('.children'), 'missing .children')
		assert.ok(css.includes('border-left'), 'children need left border for tree lines')
	})

	it('CSS includes active state with aria-current', () => {
		const css = UISidebar.styles.cssText || String(UISidebar.styles)
		assert.ok(css.includes('.active'), 'missing .active')
		assert.ok(css.includes('aria-current'), 'missing aria-current support')
	})

	it('CSS includes focus-visible for accessibility', () => {
		const css = UISidebar.styles.cssText || String(UISidebar.styles)
		assert.ok(css.includes('focus-visible'), 'missing focus-visible')
	})

	it('CSS includes responsive breakpoint', () => {
		const css = UISidebar.styles.cssText || String(UISidebar.styles)
		assert.ok(css.includes('768px'), 'missing responsive breakpoint')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UISidebar.styles.cssText || String(UISidebar.styles)
		assert.ok(css.includes('--ui-sidebar-'), 'missing --ui-sidebar- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UISidebar.prototype.render, 'function')
		assert.equal(typeof UISidebar.prototype._renderItem, 'function')
		assert.equal(typeof UISidebar.prototype._renderLeaf, 'function')
	})
})
