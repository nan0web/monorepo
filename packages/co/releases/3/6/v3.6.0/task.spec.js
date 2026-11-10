import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Model } from '@nan0web/types'

import * as CoIndex from '../../../../src/index.js'
import * as DomainIndex from '../../../../src/domain/index.js'
import Identity from '../../../../src/domain/Identity.js'
import Connection from '../../../../src/domain/Connection.js'
import Post from '../../../../src/domain/Post.js'
import Media from '../../../../src/domain/Media.js'
import Interaction from '../../../../src/domain/Interaction.js'
import Good from '../../../../src/domain/Good.js'
import Event from '../../../../src/domain/Event.js'
import Message from '../../../../src/domain/Message.js'
import Chat from '../../../../src/domain/Chat.js'
import Contact from '../../../../src/domain/Contact.js'

describe('Release v3.6.0: Fractal of Seven (7i) Models & Zero Runtime Dependencies Contract', () => {
	describe('§1 Index Exports & Domain Registry', () => {
		it('exports all 7i models + supporting models from src/domain/index.js', () => {
			assert.equal(DomainIndex.Identity, Identity)
			assert.equal(DomainIndex.Connection, Connection)
			assert.equal(DomainIndex.Post, Post)
			assert.equal(DomainIndex.Media, Media)
			assert.equal(DomainIndex.Interaction, Interaction)
			assert.equal(DomainIndex.Good, Good)
			assert.equal(DomainIndex.Event, Event)
			assert.equal(DomainIndex.Message, Message)
			assert.equal(DomainIndex.Chat, Chat)
			assert.equal(DomainIndex.Contact, Contact)
		})

		it('exposes all 7i models via the root package index', () => {
			assert.equal(CoIndex.Identity, Identity)
			assert.equal(CoIndex.Connection, Connection)
			assert.equal(CoIndex.Post, Post)
			assert.equal(CoIndex.Media, Media)
			assert.equal(CoIndex.Interaction, Interaction)
			assert.equal(CoIndex.Good, Good)
			assert.equal(CoIndex.Event, Event)
		})
	})

	describe('§2 Model 1: Identity (extends Model)', () => {
		it('inherits from Model and defines schema metadata', () => {
			assert.ok(Identity.prototype instanceof Model)
			assert.equal(Identity.id.type, 'string')
			assert.equal(Identity.type.type, 'string')
			assert.equal(Identity.title.type, 'string')
			assert.equal(Identity.role.type, 'string')
			assert.equal(Identity.declaration.type, 'string')
			assert.equal(Identity.avatar.type, 'string')
			assert.equal(Identity.endpoints.type, 'array')
			assert.equal(Identity.wallets.type, 'array')
			assert.equal(Identity.credentials.type, 'object')
		})

		it('instantiates correctly and parses Contact endpoints from URI strings', () => {
			const identity = new Identity({
				id: 'did:nan0:founder',
				type: 'person',
				title: 'Architechnomag',
				role: 'Chief Architect',
				declaration: 'Sovereign Web Paradigm',
				avatar: 'media-avatar-1',
				endpoints: ['mailto:founder@nan0web.org', 'https://t.me/founder', new Contact({ value: 'tel:+380000000000' })],
				wallets: ['0x1234567890abcdef'],
				credentials: { license: 'OpenSource' }
			})

			assert.equal(identity.id, 'did:nan0:founder')
			assert.equal(identity.did, 'did:nan0:founder')
			assert.equal(identity.type, 'person')
			assert.equal(identity.title, 'Architechnomag')
			assert.equal(identity.name, 'Architechnomag')
			assert.equal(identity.role, 'Chief Architect')
			assert.equal(identity.declaration, 'Sovereign Web Paradigm')
			assert.equal(identity.avatar, 'media-avatar-1')
			assert.equal(identity.endpoints.length, 3)
			assert.ok(identity.endpoints[0] instanceof Contact)
			assert.equal(identity.endpoints[0].toString(), 'mailto:founder@nan0web.org')
			assert.ok(identity.endpoints[1] instanceof Contact)
			assert.equal(identity.endpoints[1].toString(), 'https://t.me/founder')
			assert.ok(identity.endpoints[2] instanceof Contact)
			assert.deepEqual(identity.wallets, ['0x1234567890abcdef'])
			assert.deepEqual(identity.credentials, { license: 'OpenSource' })
		})

		it('supports did alias and name alias synchronization', () => {
			const idWithDid = new Identity({ did: 'did:nan0:org-site', name: 'My Org' })
			assert.equal(idWithDid.id, 'did:nan0:org-site')
			assert.equal(idWithDid.did, 'did:nan0:org-site')
			assert.equal(idWithDid.title, 'My Org')
			assert.equal(idWithDid.name, 'My Org')
		})
	})

	describe('§3 Model 2: Connection (extends Model)', () => {
		it('inherits from Model and defines schema metadata', () => {
			assert.ok(Connection.prototype instanceof Model)
			assert.equal(Connection.id.type, 'string')
			assert.equal(Connection.title.type, 'string')
			assert.equal(Connection.context.type, 'string')
			assert.equal(Connection.role.type, 'string')
			assert.equal(Connection.target_did.type, 'string')
			assert.equal(Connection.items.type, 'array')
		})

		it('instantiates with hierarchical navigation items', () => {
			const conn = new Connection({
				id: 'main-menu',
				title: 'Головна Навігація',
				context: 'navigation',
				role: 'header',
				target_did: 'site-root',
				items: [
					{
						title: 'Про нас',
						href: '/about',
						items: [
							{ title: 'Команда', href: '/about/team' }
						]
					},
					{ title: 'Контакти', href: '/contacts' }
				]
			})

			assert.equal(conn.id, 'main-menu')
			assert.equal(conn.title, 'Головна Навігація')
			assert.equal(conn.context, 'navigation')
			assert.equal(conn.role, 'header')
			assert.equal(conn.target_did, 'site-root')
			assert.equal(conn.items.length, 2)
			assert.equal(conn.items[0].items[0].title, 'Команда')
		})
	})

	describe('§4 Model 3: Post (extends Chat -> Message)', () => {
		it('inherits from Chat and Message and defines schema metadata', () => {
			assert.ok(Post.prototype instanceof Chat)
			assert.ok(Post.prototype instanceof Message)
			assert.equal(Post.id.type, 'string')
			assert.equal(Post.type.type, 'string')
			assert.equal(Post.title.type, 'string')
			assert.equal(Post.excerpt.type, 'string')
			assert.equal(Post.time.type, 'date')
			assert.equal(Post.status.type, 'string')
			assert.equal(Post.authors.type, 'array')
			assert.equal(Post.tags.type, 'array')
			assert.ok(Array.isArray(Post.media.type))
			assert.equal(Post.media.type[0], Media)
		})

		it('instantiates with post metadata, authors Contact parsing, and author getter', () => {
			const post = new Post({
				id: 'announcing-v3-6-0',
				type: 'post',
				title: 'Реліз Фракталу Семи 7i',
				excerpt: 'Універсальні веб-моделі у ядрі @nan0web/co',
				body: '# Контент статті\nДеталі релізу...',
				status: 'live',
				authors: ['mailto:editor@nan0web.org', 'https://t.me/author2'],
				tags: ['release', 'web7i'],
				media: ['media-cover-1', 'media-diagram-2']
			})

			assert.equal(post.id, 'announcing-v3-6-0')
			assert.equal(post.type, 'post')
			assert.equal(post.title, 'Реліз Фракталу Семи 7i')
			assert.equal(post.excerpt, 'Універсальні веб-моделі у ядрі @nan0web/co')
			assert.equal(post.body, '# Контент статті\nДеталі релізу...')
			assert.equal(post.status, 'live')
			assert.equal(post.tags.length, 2)
			assert.deepEqual(post.media, ['media-cover-1', 'media-diagram-2'])
			assert.equal(post.authors.length, 2)
			assert.ok(post.authors[0] instanceof Contact)
			assert.equal(post.authors[0].toString(), 'mailto:editor@nan0web.org')
			assert.equal(post.author.toString(), 'mailto:editor@nan0web.org')
		})

		it('validates allowed statuses', () => {
			const validate = Post.status.validate
			assert.equal(validate('draft'), true)
			assert.equal(validate('plan'), true)
			assert.equal(validate('live'), true)
			assert.equal(validate('archived'), true)
			assert.equal(validate('deleted'), true)
			assert.notEqual(validate('unknown_status'), true)
		})
	})

	describe('§5 Model 4: Media (extends Model)', () => {
		it('inherits from Model and defines clean metadata (no placement)', () => {
			assert.ok(Media.prototype instanceof Model)
			assert.equal(Media.id.type, 'string')
			assert.equal(Media.url.type, 'string')
			assert.equal(Media.mime.type, 'string')
			assert.equal(Media.caption.type, 'string')
			assert.equal(Media.filesize.type, 'number')
			assert.equal(Media.dimensions.type, 'object')
		})

		it('calculates category from mime without storing duplicate type field', () => {
			const image = new Media({
				id: 'banner-1',
				url: '/images/banner.jpg',
				mime: 'image/jpeg',
				caption: 'Головний банер',
				filesize: 1048576,
				dimensions: { width: 1920, height: 1080 }
			})

			assert.equal(image.id, 'banner-1')
			assert.equal(image.url, '/images/banner.jpg')
			assert.equal(image.mime, 'image/jpeg')
			assert.equal(image.type, 'image')
			assert.equal(image.caption, 'Головний банер')
			assert.equal(image.filesize, 1048576)
			assert.deepEqual(image.dimensions, { width: 1920, height: 1080 })
			assert.equal(image.placement, undefined)
		})
	})

	describe('§6 Model 5: Interaction (extends Message)', () => {
		it('inherits from Message and defines schema metadata', () => {
			assert.ok(Interaction.prototype instanceof Message)
			assert.equal(Interaction.id.type, 'string')
			assert.equal(Interaction.type.type, 'string')
			assert.equal(Interaction.title.type, 'string')
			assert.equal(Interaction.status.type, 'string')
			assert.equal(Interaction.sender.type, 'object')
			assert.equal(Interaction.payload.type, 'object')
		})

		it('instantiates with sender parsed to Contact and status validation', () => {
			const interaction = new Interaction({
				id: 'ticket-101',
				type: 'intake',
				title: 'Запит на підключення',
				status: 'new',
				sender: 'mailto:client@example.com',
				body: 'Прошу надати доступ до API',
				payload: { clientType: 'business', priority: 1 }
			})

			assert.equal(interaction.id, 'ticket-101')
			assert.equal(interaction.type, 'intake')
			assert.equal(interaction.title, 'Запит на підключення')
			assert.equal(interaction.status, 'new')
			assert.ok(interaction.sender instanceof Contact)
			assert.equal(interaction.sender.toString(), 'mailto:client@example.com')
			assert.equal(interaction.body, 'Прошу надати доступ до API')
			assert.deepEqual(interaction.payload, { clientType: 'business', priority: 1 })
		})

		it('validates allowed interaction statuses', () => {
			const validate = Interaction.status.validate
			assert.equal(validate('new'), true)
			assert.equal(validate('pending'), true)
			assert.equal(validate('processing'), true)
			assert.equal(validate('resolved'), true)
			assert.equal(validate('rejected'), true)
			assert.equal(validate('spam'), true)
			assert.equal(validate('archived'), true)
			assert.notEqual(validate('invalid'), true)
		})
	})

	describe('§7 Model 6: Good (extends Interaction)', () => {
		it('inherits from Interaction and defines value ontology metadata', () => {
			assert.ok(Good.prototype instanceof Interaction)
			assert.ok(Good.prototype instanceof Message)
			assert.equal(Good.id.type, 'string')
			assert.equal(Good.type.type, 'string')
			assert.equal(Good.title.type, 'string')
			assert.equal(Good.excerpt.type, 'string')
			assert.equal(Good.currency.type, 'string')
			assert.equal(Good.price.type, 'object')
			assert.equal(Good.features.type, 'array')
			assert.equal(Good.documents.type, 'array')
		})

		it('instantiates product/service/tariff value proposals', () => {
			const good = new Good({
				id: 'pro-subscription',
				type: 'tariff',
				title: 'Тарифний план Pro',
				excerpt: 'Повний безліміт для команд та агентів',
				body: '# Опис тарифу\nВключає всі модулі...',
				currency: 'EUR',
				price: { amount: 49, interval: 'month' },
				features: ['Необмежені агенти', '24/7 підтримка', 'SSOT база'],
				documents: ['/docs/terms-pro.pdf']
			})

			assert.equal(good.id, 'pro-subscription')
			assert.equal(good.type, 'tariff')
			assert.equal(good.title, 'Тарифний план Pro')
			assert.equal(good.excerpt, 'Повний безліміт для команд та агентів')
			assert.equal(good.currency, 'EUR')
			assert.deepEqual(good.price, { amount: 49, interval: 'month' })
			assert.deepEqual(good.features, ['Необмежені агенти', '24/7 підтримка', 'SSOT база'])
			assert.deepEqual(good.documents, ['/docs/terms-pro.pdf'])
		})

		it('validates allowed good types', () => {
			const validate = Good.type.validate
			assert.equal(validate('product'), true)
			assert.equal(validate('service'), true)
			assert.equal(validate('tariff'), true)
			assert.equal(validate('program'), true)
			assert.notEqual(validate('other'), true)
		})
	})

	describe('§8 Model 7: Event (extends Interaction)', () => {
		it('inherits from Interaction and defines space-time ontology metadata', () => {
			assert.ok(Event.prototype instanceof Interaction)
			assert.equal(Event.id.type, 'string')
			assert.equal(Event.type.type, 'string')
			assert.equal(Event.title.type, 'string')
			assert.equal(Event.location.type, 'string')
			assert.equal(Event.coordinates.type, 'object')
			assert.equal(Event.starts_at.type, 'date')
			assert.equal(Event.ends_at.type, 'date')
			assert.equal(Event.contacts.type, 'array')
		})

		it('instantiates space-time events and locations with contacts', () => {
			const event = new Event({
				id: 'kyiv-summit-2026',
				type: 'event',
				title: 'Kyiv Sovereign Web Summit 2026',
				location: 'вул. Хрещатик, 1, Київ',
				coordinates: { lat: 50.4501, lng: 30.5234 },
				starts_at: '2026-12-01T10:00:00Z',
				ends_at: '2026-12-01T18:00:00Z',
				contacts: ['mailto:summit@nan0web.org', 'tel:+380440000000']
			})

			assert.equal(event.id, 'kyiv-summit-2026')
			assert.equal(event.type, 'event')
			assert.equal(event.title, 'Kyiv Sovereign Web Summit 2026')
			assert.equal(event.location, 'вул. Хрещатик, 1, Київ')
			assert.deepEqual(event.coordinates, { lat: 50.4501, lng: 30.5234 })
			assert.ok(event.starts_at instanceof Date)
			assert.ok(event.ends_at instanceof Date)
			assert.equal(event.contacts.length, 2)
			assert.ok(event.contacts[0] instanceof Contact)
			assert.equal(event.contacts[0].toString(), 'mailto:summit@nan0web.org')
			assert.ok(event.contacts[1] instanceof Contact)
		})

		it('validates allowed event types', () => {
			const validate = Event.type.validate
			assert.equal(validate('location'), true)
			assert.equal(validate('branch'), true)
			assert.equal(validate('event'), true)
			assert.equal(validate('milestone'), true)
			assert.equal(validate('hearing'), true)
			assert.notEqual(validate('unknown'), true)
		})
	})
})
