import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { HydratedModel } from '../../../../src/HydratedModel.js'

describe('Release v3.4.0 Contract: HydratedModel Integration', () => {
	it('1. HydratedModel applies defaults and plain input', () => {
		const model = new HydratedModel({ title: 'Standard' })
		assert.equal(model.title, 'Standard')
	})

	it('2. HydratedModel resolves explicit $ references from parent document', () => {
		const parentDoc = {
			$files: ['/docs/rules.pdf'],
			currencies: ['UAH', 'EUR'],
		}

		const model = new HydratedModel(
			{
				title: 'Card Item',
				files: '$files',
				currencies: '$currencies',
			},
			{ parent: parentDoc }
		)

		assert.deepEqual(model.files, ['/docs/rules.pdf'])
		assert.deepEqual(model.currencies, ['UAH', 'EUR'])
	})

	it('3. HydratedModel auto-hydrates unprovided fields from parent context', () => {
		const parentDoc = {
			locale: 'uk',
			category: 'premium',
		}

		const model = new HydratedModel(
			{
				title: 'VIP Account',
			},
			{ parent: parentDoc }
		)

		assert.equal(model.title, 'VIP Account')
		assert.equal(model.category, 'premium')
	})
})
