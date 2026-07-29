import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDocumentUrl } from './document.js'

describe('normalizeDocumentUrl', () => {
	it('should default empty uri to index.json', () => {
		assert.equal(normalizeDocumentUrl(''), 'index.json')
		assert.equal(normalizeDocumentUrl('/'), 'index.json')
	})

	it('should strip .html extension', () => {
		assert.equal(normalizeDocumentUrl('page.html'), 'page.json')
		assert.equal(normalizeDocumentUrl('/about.html'), 'about.json')
	})

	it('should append index for trailing slash and use db extension', () => {
		const db = { Directory: { DATA_EXTNAMES: ['.nan0', '.json'] } }
		assert.equal(normalizeDocumentUrl('folder/', db), 'folder/index.nan0')
	})

	it('should append default extension if missing', () => {
		const db = { Directory: { DATA_EXTNAMES: ['.nan0'] } }
		assert.equal(normalizeDocumentUrl('page', db), 'page.nan0')
	})

	it('should use .json if db is not provided', () => {
		assert.equal(normalizeDocumentUrl('page'), 'page.json')
	})

	it('should preserve provided extensions', () => {
		assert.equal(normalizeDocumentUrl('data.csv'), 'data.csv')
		assert.equal(normalizeDocumentUrl('style.css'), 'style.css')
	})

	it('should strip leading slash', () => {
		assert.equal(normalizeDocumentUrl('/my-page.json'), 'my-page.json')
		assert.equal(normalizeDocumentUrl('/folder/file.json'), 'folder/file.json')
	})
})
