import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import DB from '@nan0web/db'
import Markdown from '../Markdown.js'
import { ProvenDocsAuditor } from '../inspect/index.js'

describe('Markdown & ProvenDocs Story', () => {

	describe('User Story: Nested Formatting & Anchors', () => {
		it('supports complex nested formatting', () => {
			const cases = [
				['**[link](url)**', '<strong><a href="url">link</a></strong>'],
				['*[link](url)*', '<em><a href="url">link</a></em>'],
				['[**bold**](url)', '<a href="url"><strong>bold</strong></a>'],
				['[Go](#anchor)', '<a href="#anchor">Go</a>']
			]

			for (const [input, expected] of cases) {
				const md = new Markdown(input)
				const html = md.stringify()
				assert.ok(html.includes(expected), `Expected ${html} to include ${expected}`)
			}
		})
	})

	describe('User Story: ProvenDocs Integrity (Full-Cycle)', () => {
		it('auditor detects missing documentation files', async () => {
			const db = new DB({
				predefined: [
					['src/', {}],
					['src/docs/', {}],
					['src/docs/test.md.js', 'export default {}'],
					['docs/', {}],
					['docs/index.md', '# Index'],
					['docs/README.md', '# README'],
					['docs/_/langs.md', 'uk, en'],
					// docs/test.md is missing!
				]
			})
			await db.connect()

			const auditor = new ProvenDocsAuditor({ dir: '.' }, { db })
			const result = await runGenerator(auditor.run(), {
				ask: async () => ({ value: {}, cancelled: false }),
				progress: () => {},
				show: () => {}
			})

			assert.equal(result.success, false)
			assert.ok(result.errors.some(e => e.message.includes('test.md not found')), 'Should detect missing test.md')
		})

		it('auditor passes when all files are consistent', async () => {
			const db = new DB({
				predefined: [
					['src/', {}],
					['src/docs/', {}],
					['src/docs/index.md.js', 'export default {}'],
					['docs/', {}],
					['docs/index.md', '# Index'],
					['docs/README.md', '# README'],
					['docs/uk/index.md', '# Index'],
					['docs/uk/README.md', '# README'],
					['docs/en/index.md', '# Index'],
					['docs/en/README.md', '# README'],
					['docs/_/langs.md', 'uk, en']
				]
			})
			await db.connect()

			const auditor = new ProvenDocsAuditor({ dir: '.' }, { db })
			const result = await runGenerator(auditor.run(), {
				ask: async () => ({ value: {}, cancelled: false }),
				progress: () => {},
				show: () => {}
			})

			assert.equal(result.success, true)
		})
	})
})
