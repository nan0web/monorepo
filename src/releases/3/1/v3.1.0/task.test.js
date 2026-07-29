import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '../../../../../packages/db/src/DB/DB.js'
import FormatRegistry from '../../../../../packages/db/src/FormatRegistry.js'
import DBFS from '../../../../../packages/db-fs/src/DBFS.js'
import Markdown from '../../../../../packages/markdown/src/Markdown.js'
import NaN0 from '../../../../../packages/types/src/domain/NaN0.js'

describe('v3.1.0: Dynamic Format Registry & Self-Contained Markdown Frontmatter', () => {
	describe('FormatRegistry & DB Config', () => {
		it('should register formats globally and locally', () => {
			const globalRegistry = FormatRegistry.default
			assert.ok(globalRegistry instanceof FormatRegistry)

			// Instance-specific registry
			const localRegistry = new FormatRegistry()
			localRegistry.register('.custom', (str) => ({ custom: str }), (doc) => doc.custom)

			const loader = localRegistry.resolveLoader('.custom')
			const saver = localRegistry.resolveSaver('.custom')

			assert.deepStrictEqual(loader('val'), { custom: 'val' })
			assert.equal(saver({ custom: 'val' }), 'val')
		})

		it('DB should support dynamic format registration via constructor config', async () => {
			const db = new DB({
				cwd: '.',
				formats: [
					{
						ext: '.custom',
						load: (str) => ({ custom: str }),
						save: (doc) => doc.custom,
					},
				],
			})

			const loader = db.registry.resolveLoader('.custom')
			assert.deepStrictEqual(loader('test'), { custom: 'test' })
		})

		it('DBFS should register standard formats by default', () => {
			const db = new DBFS()
			const expectedExts = ['.json', '.jsonl', '.txt', '.md', '.yaml', '.yml', '.nan', '.nan0', '.nano', '.csv', '.tsv']
			for (const ext of expectedExts) {
				const loader = db.registry.resolveLoader(ext)
				assert.ok(loader && loader !== db.registry.resolveLoader('.nonexistent'), `Should have loader for ${ext}`)
			}
		})
	})

	describe('Markdown Frontmatter (Self-Contained)', () => {
		it('should parse nan0 frontmatter by default', () => {
			const mdStr = [
				'---',
				'title: "Series 1"',
				'tags: [truth, activation]',
				'order: 1',
				'---',
				'',
				'# Title',
				'Content.',
			].join('\n')

			const md = new Markdown(mdStr)
			assert.equal(md.title, 'Series 1')
			assert.deepStrictEqual(md.tags, ['truth', 'activation'])
			assert.equal(md.order, 1)
			assert.ok(md.toString().includes('# Title'))
		})

		it('should serialize metadata back to nan0 frontmatter by default', () => {
			const md = new Markdown('# Just a header')
			md.title = 'Sovereign'
			md.order = 7

			const output = md.toString()
			assert.ok(output.startsWith('---'), 'Should start with frontmatter separator')
			assert.ok(output.includes('title: "Sovereign"'), 'Should serialize title')
			assert.ok(output.includes('order: 7'), 'Should serialize order')
			assert.ok(output.includes('# Just a header'), 'Should contain content')
		})

		it('should optionally parse and serialize yaml frontmatter when configured', () => {
			// To be defined: e.g., md.frontmatterFormat = 'yaml'
			const mdStr = [
				'---',
				'title: "YAML Title"',
				'---',
				'# YAML Header',
			].join('\n')

			const md = new Markdown({ document: null })
			md.frontmatterFormat = 'yaml'
			md.parse(mdStr)

			assert.equal(md.title, 'YAML Title')
			md.order = 10
			
			const output = md.toString()
			assert.ok(output.includes('title: YAML Title') || output.includes('title: "YAML Title"'))
			assert.ok(output.includes('order: 10'))
		})

		it('should encapsulate metadata into vars property and structure content in document', () => {
			const mdStr = [
				'---',
				'title: "Encapsulated"',
				'order: 42',
				'---',
				'# TitleContent',
			].join('\n')

			const md = new Markdown(mdStr)
			assert.deepStrictEqual(md.vars, { title: 'Encapsulated', order: 42 })
			assert.ok(md.document !== null, 'document should hold content structure')
			assert.equal(md.title, 'Encapsulated') // dynamic fallback via proxy
		})
	})

	describe('CSV0 & TSV0 Frontmatter Support', () => {
		it('should parse CSV0 file with nan0 frontmatter correctly', () => {
			const csv0Str = [
				'---',
				'title: "CSV Metadata"',
				'count: 100',
				'---',
				'Name,Age',
				'John,30',
				'Jane,25',
			].join('\n')

			const db = new DBFS()
			const loader = db.registry.resolveLoader('.csv0')
			const result = loader(csv0Str, '.csv0')

			assert.ok(Array.isArray(result), 'Result should be an array')
			assert.deepStrictEqual(result.vars, { title: 'CSV Metadata', count: 100 })
			assert.deepStrictEqual([...result], [
				{ Name: 'John', Age: 30 },
				{ Name: 'Jane', Age: 25 },
			])
		})

		it('should serialize CSV0 array with vars metadata into nan0 frontmatter CSV correctly', () => {
			const arr = [
				{ Name: 'John', Age: 30 },
				{ Name: 'Jane', Age: 25 },
			]
			arr.vars = { title: 'Sovereign CSV', count: 2 }

			const db = new DBFS()
			const saver = db.registry.resolveSaver('.csv0')
			const output = saver(arr, '.csv0')

			assert.ok(output.startsWith('---'), 'Should start with separator')
			assert.ok(output.includes('title: Sovereign CSV') || output.includes('title: "Sovereign CSV"'), 'Should contain frontmatter title')
			assert.ok(output.includes('count: 2'), 'Should contain frontmatter count')
			assert.ok(output.includes('Name,Age'), 'Should contain CSV header')
		})
	})
})
