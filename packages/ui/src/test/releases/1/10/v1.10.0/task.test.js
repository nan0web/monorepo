import test from 'node:test'
import assert from 'node:assert/strict'
import Model from '../../../../../Model/index.js'
import * as Domain from '../../../../../domain/index.js'
test('Release v1.10.0 Contract: Verification of ALL Domain Models Exported correctly via Model index', async (t) => {
	
	const models = [
		'HeaderModel', 'FooterModel', 'HeroModel',
		'PricingModel', 'CommentModel', 'TestimonialModel',
		'StatsModel', 'TimelineModel', 'EmptyStateModel',
		'BannerModel', 'ProfileDropdownModel', 'TabsModel',
		'AccordionModel', 'GalleryModel', 'SelectModel', 
		'AutocompleteModel', 'TreeModel', 'TableModel',
		'InputModel', 'ButtonModel'
	]

	for (const name of models) {
		await t.test(`should export ${name} from Model central index`, () => {
			assert.ok(Model[name], `${name} is missing from Model index`)
			assert.strictEqual(typeof Model[name], 'function', `${name} should be a constructor`)
		})
	}
})

test('Release v1.10.0 Contract: Verification of inheritance (TestimonialModel extends CommentModel)', () => {
	const testimonial = new Domain.TestimonialModel({ author: 'Alice', rating: 5 })
	assert.ok(testimonial instanceof Domain.CommentModel, 'TestimonialModel should extend CommentModel')
	assert.strictEqual(testimonial.author, 'Alice')
	assert.strictEqual(testimonial.rating, 5)
})

test('Release v1.10.0 Contract: Visibility Config Models Verification', () => {
	const visibility = new Domain.HeaderVisibilityModel({ logo: true, nav: false })
	assert.strictEqual(visibility.logo, true)
	assert.strictEqual(visibility.nav, false)
})
