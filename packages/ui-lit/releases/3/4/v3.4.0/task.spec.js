import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UINav from '../../packages/core/nav.js'
import UISidebar from '../../packages/core/sidebar.js'
import UIPage from '../../packages/core/page.js'

describe('@nan0web/ui-lit Contract Conformance (v3.4.0)', () => {
	it('UINav matches NavContract properties (brand, items)', () => {
		assert.ok(UINav.properties.brand)
		assert.ok(UINav.properties.items)
	})

	it('UISidebar matches SidebarContract properties (title, items)', () => {
		assert.ok(UISidebar.properties.title)
		assert.ok(UISidebar.properties.items)
	})

	it('UIPage matches PageContract properties (title)', () => {
		assert.ok(UIPage.properties.title)
	})
})
