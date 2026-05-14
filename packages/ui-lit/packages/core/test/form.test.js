import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import UIForm from '../form.js'

describe('ui-form', () => {
	it('exports UIForm class', () => {
		assert.ok(UIForm)
		assert.equal(typeof UIForm, 'function')
	})

	it('defines static properties schema', () => {
		assert.ok(UIForm.properties)
		assert.ok(UIForm.properties.fields)
		assert.ok(UIForm.properties.submitLabel)
		assert.ok(UIForm.properties.disabled)
		assert.ok(UIForm.properties.loading)
		assert.equal(UIForm.properties.fields.type, Array)
		assert.equal(UIForm.properties.submitLabel.type, String)
		assert.equal(UIForm.properties.disabled.type, Boolean)
		assert.equal(UIForm.properties.loading.type, Boolean)
	})

	it('disabled and loading reflect to attribute', () => {
		assert.equal(UIForm.properties.disabled.reflect, true)
		assert.equal(UIForm.properties.loading.reflect, true)
	})

	it('submitLabel maps to submit-label attribute', () => {
		assert.equal(UIForm.properties.submitLabel.attribute, 'submit-label')
	})

	it('has private _values and _errors state', () => {
		assert.ok(UIForm.properties._values)
		assert.equal(UIForm.properties._values.state, true)
		assert.ok(UIForm.properties._errors)
		assert.equal(UIForm.properties._errors.state, true)
	})

	it('defines CSS styles with form layout', () => {
		assert.ok(UIForm.styles)
		const css = UIForm.styles.cssText || String(UIForm.styles)
		assert.ok(css.includes('flex-direction'), 'CSS must have flex-direction for vertical layout')
		assert.ok(css.includes('gap'), 'CSS must have gap for spacing')
	})

	it('CSS uses CSS Custom Properties for theming', () => {
		const css = UIForm.styles.cssText || String(UIForm.styles)
		assert.ok(css.includes('--ui-form-gap'), 'CSS must use --ui-form-gap')
		assert.ok(css.includes('--ui-form-max-width'), 'CSS must use --ui-form-max-width')
	})

	it('CSS includes disabled state styling', () => {
		const css = UIForm.styles.cssText || String(UIForm.styles)
		assert.ok(css.includes('disabled'), 'CSS must include disabled state')
		assert.ok(css.includes('opacity'), 'CSS must dim disabled form')
	})

	it('has prototype methods', () => {
		const proto = UIForm.prototype
		assert.equal(typeof proto._setValue, 'function')
		assert.equal(typeof proto._onSubmit, 'function')
		assert.equal(typeof proto._renderField, 'function')
		assert.equal(typeof proto.render, 'function')
	})

	it('has values getter and setter', () => {
		const desc = Object.getOwnPropertyDescriptor(UIForm.prototype, 'values')
		assert.ok(desc, 'values must be a property')
		assert.equal(typeof desc.get, 'function')
		assert.equal(typeof desc.set, 'function')
	})

	it('constructor initializes defaults', () => {
		const inst = new UIForm()
		assert.deepEqual(inst.fields, [])
		assert.equal(inst.submitLabel, '')
		assert.equal(inst.disabled, false)
		assert.equal(inst.loading, false)
		assert.deepEqual(inst._values, {})
		assert.deepEqual(inst._errors, {})
	})
})
