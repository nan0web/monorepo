import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Document } from './Document.js'

describe('Document.normalizeUrl', () => {
	it('should normalize empty uri to index.json', () => {
		assert.equal(Document.normalizeUrl(''), 'index.json')
		assert.equal(Document.normalizeUrl('/'), 'index.json')
	})

	it('should strip .html extension', () => {
		assert.equal(Document.normalizeUrl('about.html'), 'about.json')
	})

	it('should use db default extension if provided', () => {
		const db = { Directory: { DATA_EXTNAMES: ['.nan0'] } }
		assert.equal(Document.normalizeUrl('page', db), 'page.nan0')
	})

	it('should use instance db default when calling doc.normalizeUrl()', () => {
		const db = { Directory: { DATA_EXTNAMES: ['.nan0'] } }
		const doc = new Document({}, { db })
		assert.equal(doc.normalizeUrl('home'), 'home.nan0')
	})
})
