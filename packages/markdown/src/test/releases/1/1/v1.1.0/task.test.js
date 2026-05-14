import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { DB } from '@nan0web/db'

import Markdown from '../../../../../Markdown.js'
import { ProvenDocsAuditor } from '../../../../../inspect/index.js'

const expect = (actual) => ({
	toBe: (expected) => assert.equal(actual, expected),
	toBeGreaterThan: (expected) => assert.ok(actual > expected),
	some: (fn) => {
		if (!actual.some(fn)) {
			console.error('Actual results:', JSON.stringify(actual, null, 2))
			assert.fail('Condition not met in some()')
		}
	},
	length: {
		toBe: (expected) => assert.equal(actual.length, expected),
	},
})

describe('ProvenDocsAuditor Contract v1.1.0', () => {
	const setup = async (files = {}) => {
		const db = new DB({
			predefined: new Map(Object.entries(files)),
		})
		await db.connect()
		const auditor = new ProvenDocsAuditor({ dir: '.' }, { db })
		return { auditor, db }
	}

	it('should pass on a perfect documentation set', async () => {
		const { auditor } = await setup({
			'docs/index.md': '# Index\n- [README](./README.md)',
			'docs/README.md': '# README\n## Features\n[Features](#features)',
			'docs/_/langs.md': '- en\n- uk',
		})

		const results = []
		for await (const intent of auditor.run()) {
			console.log('Intent:', JSON.stringify(intent))
			if (intent.type === 'show' && intent.status === 'error') results.push(intent)
		}

		expect(results.length).toBe(0)
	})

	it('should detect a broken link to a missing file', async () => {
		const { auditor } = await setup({
			'docs/index.md': '# Index',
			'docs/README.md': '# README\n[Broken](./missing.md)',
			'docs/_/langs.md': '- en',
		})

		const results = []
		for await (const intent of auditor.run()) {
			if (intent.type === 'show' && intent.level === 'error') results.push(intent)
		}

		expect(results).some(
			(r) => r.message.includes('Broken link') && r.message.includes('missing.md'),
		)
	})

	it('should detect a missing anchor in the same file', async () => {
		const { auditor } = await setup({
			'docs/index.md': '# Index',
			'docs/README.md': '# README\n[Ghost](#ghost)',
			'docs/_/langs.md': '- en',
		})

		const results = []
		for await (const intent of auditor.run()) {
			if (intent.type === 'show' && intent.level === 'error') results.push(intent)
		}

		expect(results).some((r) => r.message.includes('Missing anchor #ghost'))
	})

	it('should detect a missing anchor in another file', async () => {
		const { auditor } = await setup({
			'docs/index.md': '# Index',
			'docs/README.md': '# README\n[Void](./other.md#void)',
			'docs/other.md': '# Other\n## Meta',
			'docs/_/langs.md': '- en',
		})

		const results = []
		for await (const intent of auditor.run()) {
			if (intent.type === 'show' && intent.level === 'error') results.push(intent)
		}

		expect(results).some(
			(r) => r.message.includes('Missing anchor #void') && r.message.includes('other.md'),
		)
	})

	it('should detect structural missing files', async () => {
		const { auditor } = await setup({
			'docs/README.md': '# README',
		})

		const results = []
		for await (const intent of auditor.run()) {
			if (intent.type === 'show' && intent.level === 'error') results.push(intent)
		}

		expect(results).some((r) => r.message.includes('index not found'))
		expect(results).some((r) => r.message.includes('Language manifest not found'))
	})

	it('should handle non-normalized anchors in links (Slugify stability)', async () => {
		const { auditor } = await setup({
			'docs/index.md': '# Index',
			'docs/README.md': '# README\n[Go To Heading](./other.md#My-Heading-123!)',
			'docs/other.md': '# Other\n## My Heading 123!',
			'docs/_/langs.md': '- en',
		})

		const results = []
		for await (const intent of auditor.run()) {
			if (intent.type === 'show' && intent.level === 'error') results.push(intent)
		}

		// This should NOT have errors if slugify is applied to both sides
		expect(results.length).toBe(0)
	})
})

describe('Release v1.1.0: Markdown Stabilization & ProvenDocs Auditor', () => {
	describe('Inline Formatting & Nested Elements', () => {
		it('should correctly render links inside bold text', () => {
			const md = new Markdown('**[link](url)**')
			const html = md.stringify()
			assert.match(html, /<strong><a href="url">link<\/a><\/strong>/)
		})

		it('should correctly render links inside italic text', () => {
			const md = new Markdown('*[link](url)*')
			const html = md.stringify()
			assert.match(html, /<em><a href="url">link<\/a><\/em>/)
		})

		it('should correctly render bold inside links', () => {
			const md = new Markdown('[**bold**](url)')
			const html = md.stringify()
			assert.match(html, /<a href="url"><strong>bold<\/strong><\/a>/)
		})
	})

	describe('Internal Anchors (#anchor)', () => {
		it('should support internal anchors in links', () => {
			const md = new Markdown('[Go to section](#section)')
			const html = md.stringify()
			assert.match(html, /<a href="#section">Go to section<\/a>/)
		})

		it('should resolve anchors with paths correctly', () => {
			const md = new Markdown('[Link](path/to/file.md#anchor)')
			const html = md.stringify()
			assert.match(html, /href="path\/to\/file\.md#anchor"/)
		})
	})

	describe('HTML Indentation', () => {
		it('should have clean indentation for nested blocks', () => {
			const md = new Markdown('# Header\n\nParagraph')
			const html = md.stringify()
			// Currently Markdown.stringify joins with \n
			// We want to ensure it's not messy.
			assert.equal(html, '<h1>Header</h1>\n<p>Paragraph</p>')
		})
	})

	describe('ProvenDocsAuditor', () => {
		it('should exist and be an AuditorModel', () => {
			const auditor = new ProvenDocsAuditor()
			assert.ok(auditor.run, 'Should have run method')
		})

		it('should identify platform correctly', () => {
			const auditor = new ProvenDocsAuditor({ platform: 'js' })
			assert.equal(auditor.platform, 'js')
		})
	})
})
