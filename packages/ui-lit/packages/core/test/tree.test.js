import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UITree from '../tree.js'

describe('ui-tree', () => {
	it('exports UITree class', () => {
		assert.ok(UITree)
		assert.equal(typeof UITree, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UITree.properties)
		assert.ok(UITree.properties.items)
		assert.equal(UITree.properties.items.type, Array)
	})

	it('defines CSS styles with tree structure', () => {
		assert.ok(UITree.styles)
		const css = UITree.styles.cssText || String(UITree.styles)
		assert.ok(css.includes('.node'), 'missing .node')
		assert.ok(css.includes('.toggle-icon'), 'missing .toggle-icon')
		assert.ok(css.includes('.node-label'), 'missing .node-label')
		assert.ok(css.includes('.children'), 'missing .children')
	})

	it('CSS includes expand/collapse animation', () => {
		const css = UITree.styles.cssText || String(UITree.styles)
		assert.ok(css.includes('max-height'), 'missing max-height animation')
		assert.ok(css.includes('.expanded'), 'missing .expanded rotation')
		assert.ok(css.includes('rotate'), 'missing rotate transform')
	})

	it('CSS includes active state', () => {
		const css = UITree.styles.cssText || String(UITree.styles)
		assert.ok(css.includes('.active'), 'missing .active state')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UITree.styles.cssText || String(UITree.styles)
		assert.ok(css.includes('--ui-tree-'), 'missing --ui-tree- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UITree.prototype._toggleNode, 'function')
		assert.equal(typeof UITree.prototype._selectNode, 'function')
		assert.equal(typeof UITree.prototype._renderNodes, 'function')
		assert.equal(typeof UITree.prototype.render, 'function')
	})
})
