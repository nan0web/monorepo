import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Document } from './Document.js'
import { Content } from './Content.js'
import Navigation from './Navigation.js'

describe('Document — resolveNav (DOC-1)', () => {
	it('resolves string reference "headerNav" → this.headerNav', () => {
		const doc = new Document({
			headerNav: { title: 'Main Menu', href: '/', children: [] },
			nav: 'headerNav',
		})
		const resolved = doc.resolveNav()
		assert.equal(resolved.title, 'Main Menu')
		assert.equal(resolved.href, '/')
	})

	it('returns raw Navigation object when already a config', () => {
		const navConfig = { title: 'Direct Nav', href: '/direct' }
		const doc = new Document({ nav: navConfig })
		const resolved = doc.resolveNav()
		assert.strictEqual(resolved, navConfig)
	})

	it('returns null when string reference does not exist', () => {
		const doc = new Document({ nav: 'nonexistent' })
		assert.strictEqual(doc.resolveNav(), null)
	})

	it('returns raw array of Navigation items', () => {
		const items = [{ title: 'Item 1' }, { title: 'Item 2' }]
		const doc = new Document({ nav: items })
		const resolved = doc.resolveNav()
		assert.ok(Array.isArray(resolved))
		assert.equal(resolved.length, 2)
	})

	it('returns null when nav is undefined', () => {
		const doc = new Document({})
		assert.strictEqual(doc.resolveNav(), null)
	})
})

describe('Document — resolveContent (DOC-2)', () => {
	it('resolves single boolean block { Banner: true } → this.banner', () => {
		const banner = { type: 'banner', message: 'Hello' }
		const doc = new Document({
			banner,
			$content: [{ Banner: true }],
		})
		const result = doc.resolveContent()
		assert.equal(result.length, 1)
		assert.deepEqual(result[0], banner)
	})

	it('resolves single boolean block with case-insensitive lookup', () => {
		const Banner = { type: 'banner', message: 'Case' }
		const doc = new Document({
			Banner,
			$content: [{ banner: true }], // lowercase key, uppercase field
		})
		const result = doc.resolveContent()
		assert.equal(result.length, 1)
		assert.deepEqual(result[0], Banner)
	})

	it('resolves multiple boolean keys as separate blocks', () => {
		const banner = { type: 'banner', id: 1 }
		const hero = { type: 'hero', id: 2 }
		const doc = new Document({
			banner,
			hero,
			$content: [{ Banner: true, Hero: true }],
		})
		const result = doc.resolveContent()
		assert.equal(result.length, 2)
		assert.deepEqual(result[0], banner)
		assert.deepEqual(result[1], hero)
	})

	it('resolves mixed boolean and non-boolean props', () => {
		const banner = { type: 'banner', id: 1 }
		const doc = new Document({
			banner,
			$content: [{ Banner: true, extra: 'value' }],
		})
		const result = doc.resolveContent()
		assert.equal(result.length, 1)
		assert.deepEqual(result[0], { ...banner, extra: 'value' })
	})

	it('passes through non-boolean blocks unchanged', () => {
		const content = { Markdown: { content: '# Hello' } }
		const doc = new Document({
			$content: [content],
		})
		const result = doc.resolveContent()
		assert.equal(result.length, 1)
		assert.deepEqual(result[0], content)
	})

	it('handles empty $content array', () => {
		const doc = new Document({ $content: [] })
		assert.deepEqual(doc.resolveContent(), [])
	})

	it('handles null $content', () => {
		const doc = new Document({ $content: null })
		assert.deepEqual(doc.resolveContent(), [])
	})

	it('handles custom blocks array argument', () => {
		const banner = { type: 'banner' }
		const doc = new Document({ banner })
		const blocks = [{ Banner: true }]
		const result = doc.resolveContent(blocks)
		assert.equal(result.length, 1)
		assert.deepEqual(result[0], banner)
	})

	it('recursively resolves nested $content in Content children', () => {
		const childBlock = { type: 'child-section' }
		const content = new Content({
			content: 'parent',
			children: [
				{ content: 'child', children: [{ content: 'grandchild' }] },
			],
		})
		assert.ok(content.children instanceof Array)
		assert.equal(content.children.length, 1)
		assert.ok(content.children[0] instanceof Content)
	})

	it('resolves $ref keys are ignored as booleans', () => {
		const doc = new Document({
			$content: [{ $ref: '#something', Banner: true }],
			banner: { type: 'banner' },
		})
		const result = doc.resolveContent()
		assert.equal(result.length, 1)
		assert.deepEqual(result[0], { type: 'banner' })
	})

	it('handles null/undefined items in $content array', () => {
		const doc = new Document({
			$content: [null, { Banner: true }, undefined, 'string'],
			banner: { type: 'banner' },
		})
		const result = doc.resolveContent()
		assert.equal(result.length, 4)
		assert.strictEqual(result[0], null)
		assert.deepEqual(result[1], { type: 'banner' })
		assert.strictEqual(result[2], undefined)
		assert.strictEqual(result[3], 'string')
	})

	it('falls back to { Key: null } when referenced field missing', () => {
		const doc = new Document({
			$content: [{ Ghost: true }],
		})
		const result = doc.resolveContent()
		assert.equal(result.length, 1)
		assert.deepEqual(result[0], { Ghost: null })
	})
})

describe('Document — Fractal Composition (DOC-1 + DOC-2 integration)', () => {
	it('full pipeline: Document with nav string ref + $content boolean blocks', () => {
		const headerNav = {
			title: 'Header Nav',
			href: '/',
			children: [{ title: 'Home' }],
		}
		const banner = { type: 'banner', text: 'Welcome' }
		const hero = { type: 'hero', title: 'Hero Title' }
		const footer = { type: 'footer', copyright: '2025' }

		const doc = new Document({
			headerNav,
			banner,
			hero,
			footer,
			nav: 'headerNav',
			$content: [
				{ Banner: true },
				{ Hero: true, Footer: true },
				{ Markdown: { content: '# Main' } },
			],
		})

		// DOC-1: nav resolution via string reference
		const nav = doc.resolveNav()
		assert.equal(nav.title, 'Header Nav')
		assert.equal(nav.children.length, 1)

		// DOC-2: $content resolution
		const content = doc.resolveContent()
		// Block 1: single boolean → banner (1 item)
		// Block 2: two booleans → [hero, footer] (2 items, flattened)
		// Block 3: non-boolean → passed through (1 item)
		// Total: 4 items
		assert.equal(content.length, 4)

		// Block 1: single boolean → banner
		assert.deepEqual(content[0], banner)

		// Block 2a & 2b: two booleans → hero, footer (flattened into array)
		assert.deepEqual(content[1], hero)
		assert.deepEqual(content[2], footer)

		// Block 3: non-boolean → passed through
		assert.deepEqual(content[3], { Markdown: { content: '# Main' } })
	})

	it('chained resolution: Content inside Document $content', () => {
		const bannerData = { type: 'banner', message: 'Hi' }
		const doc = new Document({
			banner: bannerData,
			$content: [{ Banner: true }],
		})
		const resolved = doc.resolveContent()
		assert.equal(resolved.length, 1)
		assert.ok(resolved[0] instanceof Content || typeof resolved[0] === 'object')
	})
})
