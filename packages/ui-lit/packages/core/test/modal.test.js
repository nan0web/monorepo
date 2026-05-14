import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIModal from '../modal.js'

describe('ui-modal', () => {
	it('exports UIModal class', () => {
		assert.ok(UIModal)
		assert.equal(typeof UIModal, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIModal.properties)
		assert.ok(UIModal.properties.title)
		assert.ok(UIModal.properties.open)
		assert.ok(UIModal.properties.closable)
		assert.equal(UIModal.properties.title.type, String)
		assert.equal(UIModal.properties.open.type, Boolean)
		assert.equal(UIModal.properties.closable.type, Boolean)
	})

	it('open reflects to attribute', () => {
		assert.equal(UIModal.properties.open.reflect, true)
	})

	it('defines CSS styles with backdrop and modal', () => {
		assert.ok(UIModal.styles)
		const css = UIModal.styles.cssText || String(UIModal.styles)
		assert.ok(css.includes('.backdrop'), 'missing .backdrop')
		assert.ok(css.includes('.modal'), 'missing .modal')
		assert.ok(css.includes('.header'), 'missing .header')
		assert.ok(css.includes('.body'), 'missing .body')
		assert.ok(css.includes('.footer'), 'missing .footer')
	})

	it('CSS includes modal animations', () => {
		const css = UIModal.styles.cssText || String(UIModal.styles)
		assert.ok(css.includes('modal-fade'), 'missing modal-fade')
		assert.ok(css.includes('modal-slide'), 'missing modal-slide')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIModal.styles.cssText || String(UIModal.styles)
		assert.ok(css.includes('--ui-modal-'), 'missing --ui-modal- custom properties')
	})

	it('has prototype methods', () => {
		assert.equal(typeof UIModal.prototype._close, 'function')
		assert.equal(typeof UIModal.prototype._onBackdropClick, 'function')
		assert.equal(typeof UIModal.prototype.render, 'function')
	})
})
