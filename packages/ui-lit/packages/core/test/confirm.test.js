import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIConfirm from '../confirm.js'

describe('ui-confirm', () => {
	it('exports UIConfirm class', () => {
		assert.ok(UIConfirm)
		assert.equal(typeof UIConfirm, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIConfirm.properties)
		assert.ok(UIConfirm.properties.message)
		assert.ok(UIConfirm.properties.confirmLabel)
		assert.ok(UIConfirm.properties.cancelLabel)
		assert.ok(UIConfirm.properties.open)
		assert.ok(UIConfirm.properties.modal)
		assert.equal(UIConfirm.properties.message.type, String)
		assert.equal(UIConfirm.properties.open.type, Boolean)
		assert.equal(UIConfirm.properties.modal.type, Boolean)
	})

	it('open reflects to attribute', () => {
		assert.equal(UIConfirm.properties.open.reflect, true)
	})

	it('confirmLabel has attribute mapping', () => {
		assert.equal(UIConfirm.properties.confirmLabel.attribute, 'confirm-label')
	})

	it('defines CSS styles with backdrop and dialog', () => {
		assert.ok(UIConfirm.styles)
		const css = UIConfirm.styles.cssText || String(UIConfirm.styles)
		assert.ok(css.includes('.backdrop'), 'missing .backdrop')
		assert.ok(css.includes('.dialog'), 'missing .dialog')
		assert.ok(css.includes('.inline-dialog'), 'missing .inline-dialog')
	})

	it('CSS includes animations', () => {
		const css = UIConfirm.styles.cssText || String(UIConfirm.styles)
		assert.ok(css.includes('confirm-fade'), 'missing confirm-fade')
		assert.ok(css.includes('confirm-slide'), 'missing confirm-slide')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIConfirm.styles.cssText || String(UIConfirm.styles)
		assert.ok(css.includes('--ui-confirm-'), 'missing --ui-confirm- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIConfirm.prototype._confirm, 'function')
		assert.equal(typeof UIConfirm.prototype._cancel, 'function')
		assert.equal(typeof UIConfirm.prototype._onKeyDown, 'function')
		assert.equal(typeof UIConfirm.prototype.render, 'function')
	})
})
