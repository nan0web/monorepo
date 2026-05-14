import { describe, it } from 'node:test'
import assert from 'node:assert'
import { ProvenDocsAuditor } from './index.js'
import { DB } from '@nan0web/db'

describe('ProvenDocsAuditor', () => {
	const setup = async (files = {}) => {
		const db = new DB({
			predefined: new Map(Object.entries(files))
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
			if (intent.type === 'show' && intent.level === 'error') results.push(intent)
		}

		assert.strictEqual(results.length, 0)
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

		assert.ok(results.some(r => r.message.includes('Broken link') && r.message.includes('missing.md')))
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

		assert.ok(results.some(r => r.message.includes('Missing anchor #ghost')))
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

		assert.ok(results.some(r => r.message.includes('Missing anchor #void') && r.message.includes('other.md')))
	})

	it('should detect structural missing files', async () => {
		const { auditor } = await setup({
			'docs/README.md': '# README',
		})

		const results = []
		for await (const intent of auditor.run()) {
			if (intent.type === 'show' && intent.level === 'error') results.push(intent)
		}

		assert.ok(results.some(r => r.message.includes('index not found')))
		assert.ok(results.some(r => r.message.includes('Language manifest not found')))
	})
})
