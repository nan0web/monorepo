import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('v1.2.0 — Extended FormInput Types', () => {
	/**
	 * @contract FormInput.TYPES must contain all 13 universal input types.
	 * These types serve as a shared vocabulary between Web and CLI renderers.
	 */
	it('FormInput.TYPES contains 13 types (6 base + 7 extended)', async () => {
		const { default: FormInput } = await import('../../../../../../src/core/Form/Input.js')
		const types = FormInput.TYPES
		const expected = [
			'text',
			'email',
			'number',
			'select',
			'checkbox',
			'textarea',
			'password',
			'secret',
			'mask',
			'confirm',
			'toggle',
			'multiselect',
			'autocomplete',
		]
		assert.equal(Object.keys(types).length, 13)
		for (const t of expected) {
			assert.ok(Object.values(types).includes(t), `Missing type: ${t}`)
		}
	})

	/**
	 * @contract Every type in FormInput.TYPES must create a valid FormInput instance.
	 * No TypeError should be thrown for any registered type.
	 */
	it('every type creates a valid FormInput without TypeError', async () => {
		const { default: FormInput } = await import('../../../../../../src/core/Form/Input.js')
		for (const [key, type] of Object.entries(FormInput.TYPES)) {
			const input = new FormInput({ name: `field_${key}`, type })
			assert.equal(input.type, type)
			assert.equal(input.name, `field_${key}`)
		}
	})

	/**
	 * @contract Extended types maintain backward compatibility.
	 * Base types (text, email, number, select, checkbox, textarea) must still work.
	 */
	it('base types remain unchanged', async () => {
		const { default: FormInput } = await import('../../../../../../src/core/Form/Input.js')
		assert.equal(FormInput.TYPES.TEXT, 'text')
		assert.equal(FormInput.TYPES.EMAIL, 'email')
		assert.equal(FormInput.TYPES.NUMBER, 'number')
		assert.equal(FormInput.TYPES.SELECT, 'select')
		assert.equal(FormInput.TYPES.CHECKBOX, 'checkbox')
		assert.equal(FormInput.TYPES.TEXTAREA, 'textarea')
	})

	/**
	 * @contract Extended type keys follow UPPER_CASE convention.
	 */
	it('extended type keys are UPPER_CASE', async () => {
		const { default: FormInput } = await import('../../../../../../src/core/Form/Input.js')
		assert.equal(FormInput.TYPES.PASSWORD, 'password')
		assert.equal(FormInput.TYPES.SECRET, 'secret')
		assert.equal(FormInput.TYPES.MASK, 'mask')
		assert.equal(FormInput.TYPES.CONFIRM, 'confirm')
		assert.equal(FormInput.TYPES.TOGGLE, 'toggle')
		assert.equal(FormInput.TYPES.MULTISELECT, 'multiselect')
		assert.equal(FormInput.TYPES.AUTOCOMPLETE, 'autocomplete')
	})

	/**
	 * @contract package.json version must be 1.2.0 for this release.
	 */
	it.skip('package.json version is 1.2.0', () => {
		const pkg = JSON.parse(
			readFileSync(new URL('../../../../../package.json', import.meta.url), 'utf8'),
		)
		assert.equal(pkg.version, '1.2.0')
	})

	/**
	 * @contract Invalid types must still throw TypeError.
	 */
	it('invalid type still throws TypeError', async () => {
		const { default: FormInput } = await import('../../../../../../src/core/Form/Input.js')
		assert.throws(() => new FormInput({ name: 'bad', type: 'nonexistent' }), { name: 'TypeError' })
	})
})
