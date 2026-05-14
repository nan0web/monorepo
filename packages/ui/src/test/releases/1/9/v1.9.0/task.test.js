import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import path from 'path'

const root = path.resolve(import.meta.dirname, '../../../../../../')

// ─── Phase 1: Layout Models ───────────────────────────────────

describe('v1.9.0 Phase 1: Layout Models', () => {
	it('HeaderModel extends Model with $id and Navigation[] actions', async () => {
		const { Model } = await import('@nan0web/core')
		const { HeaderModel } = await import(path.join(root, 'src/domain/HeaderModel.js'))
		assert.equal(HeaderModel.$id, '@nan0web/ui/HeaderModel')
		const h = new HeaderModel({ title: 'Site', logo: '/logo.svg' })
		assert.ok(h instanceof Model)
		assert.equal(h.title, 'Site')
		assert.deepEqual(h.actions, [])
		assert.equal(h.lang, null)
		assert.deepEqual(h.langs, [])
	})

	it('FooterModel extends Model with copyright, version, license, nav[], share[], langs[]', async () => {
		const { Model } = await import('@nan0web/core')
		const { FooterModel } = await import(path.join(root, 'src/domain/FooterModel.js'))
		assert.equal(FooterModel.$id, '@nan0web/ui/FooterModel')
		const f = new FooterModel({ copyright: '© 2026', version: '1.9.0', license: 'ISC' })
		assert.ok(f instanceof Model)
		assert.equal(f.copyright, '© 2026')
		assert.deepEqual(f.nav, [])
		assert.deepEqual(f.share, [])
	})

	it('HeroModel extends Model with actions[] replacing single CTA', async () => {
		const { Model } = await import('@nan0web/core')
		const { HeroModel } = await import(path.join(root, 'src/domain/HeroModel.js'))
		assert.equal(HeroModel.$id, '@nan0web/ui/HeroModel')
		const hero = new HeroModel({
			title: 'Welcome',
			actions: [{ title: 'Start', href: '/go' }],
		})
		assert.ok(hero instanceof Model)
		assert.equal(hero.actions.length, 1)
		assert.equal(hero.actions[0].title, 'Start')
	})
})

// ─── Phase 2: Universal Components ───────────────────────────

describe('v1.9.0 Phase 2: Universal Components', () => {
	it('PriceModel has value (number) and currency (string)', async () => {
		const { Model } = await import('@nan0web/core')
		const { PriceModel } = await import(path.join(root, 'src/domain/components/PriceModel.js'))
		const p = new PriceModel({ value: 29.99, currency: 'EUR' })
		assert.ok(p instanceof Model)
		assert.equal(p.value, 29.99)
		assert.equal(p.currency, 'EUR')
	})

	it('PricingModel has title, price ref, features array', async () => {
		const { Model } = await import('@nan0web/core')
		const { PricingModel } = await import(path.join(root, 'src/domain/components/PricingModel.js'))
		const plan = new PricingModel({
			title: 'Pro',
			features: ['Unlimited users', 'Priority support'],
		})
		assert.ok(plan instanceof Model)
		assert.equal(plan.title, 'Pro')
		assert.equal(plan.features.length, 2)
	})

	it('CommentModel has author, avatar, text, date', async () => {
		const { Model } = await import('@nan0web/core')
		const { CommentModel } = await import(path.join(root, 'src/domain/components/CommentModel.js'))
		const c = new CommentModel({ author: 'Alice', text: 'Nice!', date: '2026-03-26' })
		assert.ok(c instanceof Model)
		assert.equal(c.author, 'Alice')
	})

	it('TestimonialModel extends CommentModel with rating', async () => {
		const { Model } = await import('@nan0web/core')
		const { CommentModel } = await import(path.join(root, 'src/domain/components/CommentModel.js'))
		const { TestimonialModel } = await import(path.join(root, 'src/domain/components/TestimonialModel.js'))
		const t = new TestimonialModel({ author: 'Bob', text: 'Amazing!', rating: 4 })
		assert.ok(t instanceof CommentModel, 'TestimonialModel must extend CommentModel')
		assert.ok(t instanceof Model)
		assert.equal(t.rating, 4)
	})

	it('StatsItemModel has label, value, trend', async () => {
		const { Model } = await import('@nan0web/core')
		const { StatsItemModel } = await import(path.join(root, 'src/domain/components/StatsItemModel.js'))
		const s = new StatsItemModel({ label: 'Users', value: '10K', trend: '+12%' })
		assert.ok(s instanceof Model)
		assert.equal(s.trend, '+12%')
	})

	it('StatsModel wraps StatsItemModel[] items', async () => {
		const { Model } = await import('@nan0web/core')
		const { StatsModel } = await import(path.join(root, 'src/domain/components/StatsModel.js'))
		const stats = new StatsModel({ items: [{ label: 'Rev', value: '$1M' }] })
		assert.ok(stats instanceof Model)
		assert.equal(stats.items.length, 1)
	})

	it('TimelineItemModel has date, title, description', async () => {
		const { Model } = await import('@nan0web/core')
		const { TimelineItemModel } = await import(path.join(root, 'src/domain/components/TimelineItemModel.js'))
		const e = new TimelineItemModel({ date: '2026-01-01', title: 'Launch' })
		assert.ok(e instanceof Model)
		assert.equal(e.title, 'Launch')
	})

	it('TimelineModel wraps TimelineItemModel[] items', async () => {
		const { Model } = await import('@nan0web/core')
		const { TimelineModel } = await import(path.join(root, 'src/domain/components/TimelineModel.js'))
		const tl = new TimelineModel({ items: [{ date: '2025-01-01', title: 'Founded' }] })
		assert.ok(tl instanceof Model)
		assert.equal(tl.items.length, 1)
	})

	it('TabsModel has active index and tabs definitions', async () => {
		const { Model } = await import('@nan0web/core')
		const { TabsModel } = await import(path.join(root, 'src/domain/components/TabsModel.js'))
		const tabs = new TabsModel({ active: 1, tabs: [{ label: 'A', content: 'a' }] })
		assert.ok(tabs instanceof Model)
		assert.equal(tabs.active, 1)
	})

	it('AccordionModel has title, content, open', async () => {
		const { Model } = await import('@nan0web/core')
		const { AccordionModel } = await import(path.join(root, 'src/domain/components/AccordionModel.js'))
		const faq = new AccordionModel({ title: 'FAQ?', content: 'Answer.', open: true })
		assert.ok(faq instanceof Model)
		assert.equal(faq.open, true)
	})

	it('GalleryModel has items and configurable columns', async () => {
		const { Model } = await import('@nan0web/core')
		const { GalleryModel } = await import(path.join(root, 'src/domain/components/GalleryModel.js'))
		const g = new GalleryModel({ items: [{ src: '/a.jpg' }], columns: 4 })
		assert.ok(g instanceof Model)
		assert.equal(g.columns, 4)
	})
})

// ─── Phase 3: Visibility Configs ─────────────────────────────

describe('v1.9.0 Phase 3: Visibility Configs', () => {
	it('HeaderVisibilityModel has boolean flags with correct defaults', async () => {
		const { Model } = await import('@nan0web/core')
		const { HeaderVisibilityModel } = await import(path.join(root, 'src/domain/components/HeaderVisibilityModel.js'))
		const v = new HeaderVisibilityModel()
		assert.ok(v instanceof Model)
		assert.equal(v.logo, true)
		assert.equal(v.theme, true)
		assert.equal(v.search, false)
		assert.equal(v.share, false)
		assert.equal(v.nav, true)
		assert.equal(v.langs, true)
	})

	it('HeaderConfigModel wraps ui: Record<string, HeaderVisibilityModel>', async () => {
		const { Model } = await import('@nan0web/core')
		const { HeaderConfigModel } = await import(path.join(root, 'src/domain/components/HeaderConfigModel.js'))
		const c = new HeaderConfigModel({ ui: { minimal: { logo: true, nav: false } } })
		assert.ok(c instanceof Model)
		assert.equal(c.ui.minimal.nav, false)
	})

	it('FooterVisibilityModel has boolean flags with correct defaults', async () => {
		const { Model } = await import('@nan0web/core')
		const { FooterVisibilityModel } = await import(path.join(root, 'src/domain/components/FooterVisibilityModel.js'))
		const v = new FooterVisibilityModel()
		assert.ok(v instanceof Model)
		assert.equal(v.copyright, true)
		assert.equal(v.version, true)
		assert.equal(v.license, false)
		assert.equal(v.clock, false)
	})

	it('FooterConfigModel wraps ui: Record<string, FooterVisibilityModel>', async () => {
		const { Model } = await import('@nan0web/core')
		const { FooterConfigModel } = await import(path.join(root, 'src/domain/components/FooterConfigModel.js'))
		const c = new FooterConfigModel({ ui: { compact: { copyright: true, version: false } } })
		assert.ok(c instanceof Model)
		assert.equal(c.ui.compact.version, false)
	})
})

// ─── Phase 4: Business Critical ──────────────────────────────

describe('v1.9.0 Phase 4: Business Critical', () => {
	it('EmptyStateModel has icon, title, description, action (Navigation)', async () => {
		const { Model } = await import('@nan0web/core')
		const { EmptyStateModel } = await import(path.join(root, 'src/domain/components/EmptyStateModel.js'))
		const e = new EmptyStateModel({ title: 'No items yet', icon: 'inbox' })
		assert.ok(e instanceof Model)
		assert.equal(e.title, 'No items yet')
		assert.equal(e.action, null)
	})

	it('BannerModel has text, href, closable (system-level notification)', async () => {
		const { Model } = await import('@nan0web/core')
		const { BannerModel } = await import(path.join(root, 'src/domain/components/BannerModel.js'))
		const b = new BannerModel({ text: 'Cookie notice', href: '/privacy', closable: false })
		assert.ok(b instanceof Model)
		assert.equal(b.text, 'Cookie notice')
		assert.equal(b.closable, false)
	})

	it('ProfileDropdownModel has name, email, avatar, actions[]', async () => {
		const { Model } = await import('@nan0web/core')
		const { ProfileDropdownModel } = await import(path.join(root, 'src/domain/components/ProfileDropdownModel.js'))
		const p = new ProfileDropdownModel({
			name: 'Jane',
			email: 'jane@test.com',
			actions: [{ title: 'Logout', href: '/logout' }],
		})
		assert.ok(p instanceof Model)
		assert.equal(p.profileName, 'Jane')
		assert.equal(p.actions.length, 1)
	})
})

// ─── Phase 5: Export Integration ─────────────────────────────

describe('v1.9.0 Phase 5: Export & Integration', () => {
	it('domain/index.js exports all 30 models', async () => {
		const domain = await import(path.join(root, 'src/domain/index.js'))
		const expectedExports = [
			// Core
			'SandboxModel', 'ShowcaseAppModel', 'Navigation',
			// Phase 1
			'HeaderModel', 'FooterModel', 'HeroModel',
			// Phase 2
			'ButtonModel', 'ConfirmModel', 'InputModel', 'SpinnerModel',
			'TableModel', 'ToastModel', 'SelectModel', 'AutocompleteModel',
			'TreeModel', 'TabsModel', 'AccordionModel', 'GalleryModel',
			'PriceModel', 'PricingModel', 'CommentModel', 'TestimonialModel',
			'StatsItemModel', 'StatsModel', 'TimelineItemModel', 'TimelineModel',
			// Phase 3
			'HeaderVisibilityModel', 'HeaderConfigModel',
			'FooterVisibilityModel', 'FooterConfigModel',
			// Phase 4
			'EmptyStateModel', 'BannerModel', 'ProfileDropdownModel',
		]
		for (const name of expectedExports) {
			assert.ok(domain[name], `domain/index.js must export ${name}`)
		}
	})

	it('all new models have unique static $id', async () => {
		const domain = await import(path.join(root, 'src/domain/index.js'))
		const ids = new Set()
		const modelsWithId = [
			'HeaderModel', 'FooterModel', 'HeroModel',
			'PriceModel', 'PricingModel', 'CommentModel', 'TestimonialModel',
			'StatsItemModel', 'StatsModel', 'TimelineItemModel', 'TimelineModel',
			'TabsModel', 'AccordionModel', 'GalleryModel',
			'HeaderVisibilityModel', 'HeaderConfigModel',
			'FooterVisibilityModel', 'FooterConfigModel',
			'EmptyStateModel', 'BannerModel', 'ProfileDropdownModel',
		]
		for (const name of modelsWithId) {
			const ModelClass = domain[name]
			assert.ok(ModelClass.$id, `${name} must have static $id`)
			assert.ok(!ids.has(ModelClass.$id), `Duplicate $id: ${ModelClass.$id}`)
			ids.add(ModelClass.$id)
		}
	})
})
