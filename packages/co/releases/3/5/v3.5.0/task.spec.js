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
import Service from '../../../../src/domain/Service.js'
import Event from '../../../../src/domain/Event.js'
import Message from '../../../../src/domain/Message.js'
import Chat from '../../../../src/domain/Chat.js'
import Contact from '../../../../src/domain/Contact.js'
import Language from '../../../../src/domain/Language.js'

describe('Release v3.5.0: Verse Domain Architecture & Media Hybrid System', () => {
	describe('§1 Structure: src -> src/domain & Exports', () => {
		it('exports all domain models from src/domain/index.js', () => {
			assert.equal(DomainIndex.Identity, Identity)
			assert.equal(DomainIndex.Connection, Connection)
			assert.equal(DomainIndex.Post, Post)
			assert.equal(DomainIndex.Media, Media)
			assert.equal(DomainIndex.Interaction, Interaction)
			assert.equal(DomainIndex.Service, Service)
			assert.equal(DomainIndex.Event, Event)
			assert.equal(DomainIndex.Message, Message)
			assert.equal(DomainIndex.Chat, Chat)
			assert.equal(DomainIndex.Contact, Contact)
			assert.equal(DomainIndex.Language, Language)
		})

		it('exposes all domain models via the main package index (backward compatibility)', () => {
			assert.equal(CoIndex.Identity, Identity)
			assert.equal(CoIndex.Connection, Connection)
			assert.equal(CoIndex.Post, Post)
			assert.equal(CoIndex.Media, Media)
			assert.equal(CoIndex.Interaction, Interaction)
			assert.equal(CoIndex.Service, Service)
			assert.equal(CoIndex.Event, Event)
			assert.equal(CoIndex.Message, Message)
			assert.equal(CoIndex.Chat, Chat)
			assert.equal(CoIndex.Contact, Contact)
			assert.equal(CoIndex.Language, Language)
		})
	})

	describe('§2 Media Model & Hybrid Post Integration (Format A + B)', () => {
		it('Media extends Model and defines required static metadata', () => {
			assert.ok(Media.prototype instanceof Model)
			assert.equal(Media.id.type, 'string')
			assert.equal(Media.url.type, 'string')
			assert.equal(Media.type.type, 'string')
			assert.equal(Media.caption.type, 'string')
			assert.equal(Media.placement.type, 'object')
		})

		it('Media instantiates with default and custom values', () => {
			const item = new Media({
				id: 'photo-hero',
				url: 'ipfs://bafybeicct2',
				type: 'image',
				caption: 'Main banner',
				placement: { after_paragraph: 1, align: 'center' },
			})

			assert.equal(item.id, 'photo-hero')
			assert.equal(item.url, 'ipfs://bafybeicct2')
			assert.equal(item.type, 'image')
			assert.equal(item.caption, 'Main banner')
			assert.deepEqual(item.placement, { after_paragraph: 1, align: 'center' })
		})

		it('Post defines static media of type [Media]', () => {
			assert.ok(Array.isArray(Post.media.type))
			assert.equal(Post.media.type[0], Media)
		})

		it('Post automatically instantiates Media objects from plain objects', () => {
			const post = new Post({
				id: 'post-101',
				title: 'Post with Hybrid Media',
				body: 'Intro text ::media[photo-hero]\n\nSecond paragraph.',
				media: [
					{
						id: 'photo-hero',
						url: 'https://cdn.example.com/hero.jpg',
						type: 'image',
						caption: 'Hero graphic',
					},
					{
						id: 'diagram-flow',
						url: 'https://cdn.example.com/flow.svg',
						type: 'image',
						placement: { after_paragraph: 2, align: 'left' },
					},
				],
			})

			assert.equal(post.media.length, 2)
			assert.ok(post.media[0] instanceof Media)
			assert.equal(post.media[0].id, 'photo-hero')
			assert.ok(post.media[1] instanceof Media)
			assert.equal(post.media[1].id, 'diagram-flow')
			assert.deepEqual(post.media[1].placement, { after_paragraph: 2, align: 'left' })
		})

		it('supports Hybrid Format A (shortcode anchor) & Format B (placement directive)', () => {
			const postContent = `# Announcement
Here is our new design:
::media[banner-1]

Further updates are described below.`

			const post = new Post({
				body: postContent,
				media: [
					// Format A: targeted by shortcode ::media[banner-1]
					{ id: 'banner-1', url: '/images/banner.png' },
					// Format B: positioned via placement directive
					{ id: 'side-widget', url: '/images/side.png', placement: { after_paragraph: 2 } },
				],
			})

			// Format A verification
			assert.ok(post.body.includes(`::media[${post.media[0].id}]`))
			// Format B verification
			assert.deepEqual(post.media[1].placement, { after_paragraph: 2 })
		})
	})

	describe('§3 Message 100% Backward Compatibility & Extensibility', () => {
		it('supports parseBody with static Body schema and defaults', () => {
			class CustomBody {
				static role = {
					defaultValue: 'guest',
				}
				static age = {
					type: 'number',
					defaultValue: 18,
				}
			}

			const parsed = Message.parseBody({ age: '25' }, CustomBody)
			assert.equal(parsed.role, 'guest')
			assert.equal(parsed.age, 25)
		})

		it('supports validation rules on Message.Body', () => {
			class ValidatedBody {
				static code = {
					required: true,
					pattern: /^[A-Z]{3}$/,
				}
			}

			class ValidatedMessage extends Message {
				static Body = ValidatedBody
				constructor(input) {
					super(input)
				}
			}

			const invalidMsg = new ValidatedMessage({ body: { code: 'bad' } })
			assert.equal(invalidMsg.isValid, false)
			assert.ok(invalidMsg.validate().has('code'))

			const validMsg = new ValidatedMessage({ body: { code: 'ABC' } })
			assert.equal(validMsg.isValid, true)
		})
	})
})
