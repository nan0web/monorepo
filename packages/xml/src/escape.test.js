import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import escape from './escape.js'

describe('escape()', () => {
	it('basic characters', () => {
		const input = `&<>"'`
		const expected = '&amp;&lt;&gt;&quot;&#039;'
		assert.equal(escape(input), expected)
	})

	it('with ignore list', () => {
		const input = `&<>"'`
		const expected = '&amp;<>&quot;&#039;'
		assert.equal(escape(input, ['<', '>']), expected)
	})

	it('non‑string primitive', () => {
		assert.equal(escape(123), '123')
		assert.equal(escape(true), 'true')
	})

	it('How to escape untrusted HTML content safely?', () => {
		//import { escape } from '@nan0web/html'
		const unsafe = '<script>alert("xss")</script>'
		assert.equal(escape(unsafe), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
	})
})
