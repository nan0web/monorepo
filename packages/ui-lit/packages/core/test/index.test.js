import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
	UIAlert,
	UIBadge,
	UITable,
	UICodeBlock,
	UIThemeToggle,
	UILangSelect,
	UIMarkdown,
	UINav,
	UISidebar,
} from '../index.js'

describe('core/index.js — barrel exports', () => {
	it('exports all 9 components', () => {
		const components = {
			UIAlert,
			UIBadge,
			UITable,
			UICodeBlock,
			UIThemeToggle,
			UILangSelect,
			UIMarkdown,
			UINav,
			UISidebar,
		}
		for (const [name, Component] of Object.entries(components)) {
			assert.ok(Component, `${name} must be exported`)
			assert.equal(typeof Component, 'function', `${name} must be a constructor`)
		}
	})

	it('each component has static properties', () => {
		const all = [
			UIAlert,
			UIBadge,
			UITable,
			UICodeBlock,
			UIThemeToggle,
			UILangSelect,
			UIMarkdown,
			UINav,
			UISidebar,
		]
		for (const Component of all) {
			assert.ok(
				Component.properties,
				`${Component.name || 'Component'} must have static properties`,
			)
		}
	})

	it('each component has static styles', () => {
		const all = [
			UIAlert,
			UIBadge,
			UITable,
			UICodeBlock,
			UIThemeToggle,
			UILangSelect,
			UIMarkdown,
			UINav,
			UISidebar,
		]
		for (const Component of all) {
			assert.ok(Component.styles, `${Component.name || 'Component'} must have static styles`)
		}
	})

	it('each component has render method', () => {
		const all = [
			UIAlert,
			UIBadge,
			UITable,
			UICodeBlock,
			UIThemeToggle,
			UILangSelect,
			UIMarkdown,
			UINav,
			UISidebar,
		]
		for (const Component of all) {
			assert.equal(
				typeof Component.prototype.render,
				'function',
				`${Component.name || 'Component'} must have render()`,
			)
		}
	})
})
