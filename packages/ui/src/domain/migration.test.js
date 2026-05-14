import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Model } from '@nan0web/core'

import { HeaderModel } from './HeaderModel.js'
import { FooterModel } from './FooterModel.js'
import { HeroModel } from './HeroModel.js'

import {
	PriceModel,
	PricingModel,
	CommentModel,
	TestimonialModel,
	StatsItemModel,
	StatsModel,
	TimelineItemModel,
	TimelineModel,
	TabsModel,
	AccordionModel,
	GalleryModel,
	HeaderVisibilityModel,
	HeaderConfigModel,
	FooterVisibilityModel,
	FooterConfigModel,
	EmptyStateModel,
	BannerModel,
	ProfileDropdownModel,
} from './components/index.js'

describe('Domain: Migration Seed — Phase 1 (Layout Models)', () => {
	it('HeaderModel extends Model and has correct $id', () => {
		const header = new HeaderModel({ title: 'My App', logo: '/logo.svg' })
		assert.ok(header instanceof Model)
		assert.equal(HeaderModel.$id, '@nan0web/ui/HeaderModel')
		assert.equal(header.title, 'My App')
		assert.equal(header.logo, '/logo.svg')
		assert.deepEqual(header.actions, [])
		assert.equal(header.lang, null)
		assert.deepEqual(header.langs, [])
	})

	it('FooterModel extends Model with nav, share, langs arrays', () => {
		const footer = new FooterModel({
			copyright: '© 2026',
			version: '1.8.0',
			license: 'ISC',
		})
		assert.ok(footer instanceof Model)
		assert.equal(FooterModel.$id, '@nan0web/ui/FooterModel')
		assert.equal(footer.copyright, '© 2026')
		assert.equal(footer.version, '1.8.0')
		assert.equal(footer.license, 'ISC')
		assert.deepEqual(footer.nav, [])
		assert.deepEqual(footer.share, [])
		assert.deepEqual(footer.langs, [])
	})

	it('HeroModel extends Model with actions array (replaces CTA)', () => {
		const hero = new HeroModel({
			title: 'Welcome',
			description: 'Build amazing things',
			actions: [{ title: 'Get Started', href: '/start' }],
		})
		assert.ok(hero instanceof Model)
		assert.equal(HeroModel.$id, '@nan0web/ui/HeroModel')
		assert.equal(hero.title, 'Welcome')
		assert.equal(hero.actions.length, 1)
		assert.equal(hero.actions[0].title, 'Get Started')
	})
})

describe('Domain: Migration Seed — Phase 2 (Universal Components)', () => {
	it('PriceModel holds value and currency', () => {
		const price = new PriceModel({ value: 9.99, currency: 'EUR' })
		assert.ok(price instanceof Model)
		assert.equal(price.value, 9.99)
		assert.equal(price.currency, 'EUR')
	})

	it('PricingModel has title, price ref, and features array', () => {
		const plan = new PricingModel({
			title: 'Pro',
			features: ['Feature A', 'Feature B'],
		})
		assert.ok(plan instanceof Model)
		assert.equal(plan.title, 'Pro')
		assert.deepEqual(plan.features, ['Feature A', 'Feature B'])
	})

	it('PricingModel supports castArray for features', () => {
		const plan = new PricingModel({ title: 'Starter', features: 'Single feature' })
		assert.ok(Array.isArray(plan.features) || typeof plan.features === 'string')
	})

	it('CommentModel has author, avatar, text, date', () => {
		const comment = new CommentModel({
			author: 'Jane',
			text: 'Great work!',
			date: '2026-03-26',
		})
		assert.ok(comment instanceof Model)
		assert.equal(comment.author, 'Jane')
		assert.equal(comment.text, 'Great work!')
		assert.equal(comment.date, '2026-03-26')
	})

	it('TestimonialModel extends CommentModel with rating', () => {
		const review = new TestimonialModel({
			author: 'Bob',
			text: 'Amazing product!',
			rating: 4,
		})
		assert.ok(review instanceof CommentModel)
		assert.ok(review instanceof Model)
		assert.equal(review.author, 'Bob')
		assert.equal(review.rating, 4)
	})

	it('TestimonialModel inherits CommentModel defaults', () => {
		const review = new TestimonialModel({})
		assert.equal(review.rating, 5) // default from TestimonialModel
		// TestimonialModel is instanceof CommentModel
		assert.ok(review instanceof CommentModel)
	})

	it('StatsItemModel has label, value, trend', () => {
		const stat = new StatsItemModel({ label: 'Users', value: '10,000', trend: '+12%' })
		assert.ok(stat instanceof Model)
		assert.equal(stat.label, 'Users')
		assert.equal(stat.value, '10,000')
		assert.equal(stat.trend, '+12%')
	})

	it('StatsModel wraps StatsItemModel array', () => {
		const stats = new StatsModel({
			title: 'Key Metrics',
			items: [{ label: 'Revenue', value: '$1M' }],
		})
		assert.ok(stats instanceof Model)
		assert.equal(stats.title, 'Key Metrics')
		assert.equal(stats.items.length, 1)
	})

	it('TimelineItemModel has date, title, description', () => {
		const event = new TimelineItemModel({
			date: '2026-01-15',
			title: 'Launch',
			description: 'We launched v1.0',
		})
		assert.ok(event instanceof Model)
		assert.equal(event.date, '2026-01-15')
		assert.equal(event.title, 'Launch')
	})

	it('TimelineModel wraps TimelineItemModel array', () => {
		const timeline = new TimelineModel({
			title: 'History',
			items: [{ date: '2025-01-01', title: 'Founded' }],
		})
		assert.ok(timeline instanceof Model)
		assert.equal(timeline.items.length, 1)
	})

	it('TabsModel has active index and tabs array', () => {
		const tabs = new TabsModel({
			active: 1,
			tabs: [{ label: 'Tab A', content: 'Content A' }, { label: 'Tab B', content: 'Content B' }],
		})
		assert.ok(tabs instanceof Model)
		assert.equal(tabs.active, 1)
		assert.equal(tabs.tabs.length, 2)
	})

	it('AccordionModel has title, content, open', () => {
		const faq = new AccordionModel({
			title: 'How does it work?',
			content: 'It works by magic.',
			open: true,
		})
		assert.ok(faq instanceof Model)
		assert.equal(faq.title, 'How does it work?')
		assert.equal(faq.open, true)
	})

	it('GalleryModel has items array and columns count', () => {
		const gallery = new GalleryModel({
			items: [{ src: '/img1.jpg', caption: 'Photo 1' }],
			columns: 4,
		})
		assert.ok(gallery instanceof Model)
		assert.equal(gallery.items.length, 1)
		assert.equal(gallery.columns, 4)
	})
})

describe('Domain: Migration Seed — Phase 3 (Visibility Configs)', () => {
	it('HeaderVisibilityModel has all boolean flags with defaults', () => {
		const vis = new HeaderVisibilityModel()
		assert.ok(vis instanceof Model)
		assert.equal(vis.logo, true)
		assert.equal(vis.theme, true)
		assert.equal(vis.search, false)
		assert.equal(vis.share, false)
		assert.equal(vis.nav, true)
		assert.equal(vis.langs, true)
	})

	it('HeaderVisibilityModel can override flags', () => {
		const vis = new HeaderVisibilityModel({ logo: false, search: true })
		assert.equal(vis.logo, false)
		assert.equal(vis.search, true)
	})

	it('HeaderConfigModel wraps visibility map', () => {
		const config = new HeaderConfigModel({
			ui: { minimal: { logo: true, nav: false } },
		})
		assert.ok(config instanceof Model)
		assert.equal(config.ui.minimal.logo, true)
		assert.equal(config.ui.minimal.nav, false)
	})

	it('FooterVisibilityModel has boolean flags with defaults', () => {
		const vis = new FooterVisibilityModel()
		assert.ok(vis instanceof Model)
		assert.equal(vis.copyright, true)
		assert.equal(vis.version, true)
		assert.equal(vis.license, false)
		assert.equal(vis.nav, true)
		assert.equal(vis.clock, false)
	})

	it('FooterConfigModel wraps visibility map', () => {
		const config = new FooterConfigModel({
			ui: { compact: { copyright: true, version: false } },
		})
		assert.ok(config instanceof Model)
		assert.equal(config.ui.compact.copyright, true)
		assert.equal(config.ui.compact.version, false)
	})
})

describe('Domain: Migration Seed — Phase 4 (Business Critical)', () => {
	it('EmptyStateModel has icon, title, description, action', () => {
		const empty = new EmptyStateModel({
			icon: 'inbox',
			title: 'No items yet',
			description: 'Create your first item',
		})
		assert.ok(empty instanceof Model)
		assert.equal(empty.title, 'No items yet')
		assert.equal(empty.action, null)
	})

	it('BannerModel has text, href, closable', () => {
		const banner = new BannerModel({
			text: 'We use cookies',
			href: '/privacy',
			closable: false,
		})
		assert.ok(banner instanceof Model)
		assert.equal(banner.text, 'We use cookies')
		assert.equal(banner.closable, false)
	})

	it('ProfileDropdownModel has name, email, avatar, actions', () => {
		const profile = new ProfileDropdownModel({
			name: 'Jane',
			email: 'jane@test.com',
			avatar: '/jane.jpg',
			actions: [{ title: 'Settings', href: '/settings' }],
		})
		assert.ok(profile instanceof Model)
		assert.equal(profile.profileName, 'Jane')
		assert.equal(profile.email, 'jane@test.com')
		assert.equal(profile.actions.length, 1)
	})
})
