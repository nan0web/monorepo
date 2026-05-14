import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { TranslateDocsModel } from './TranslateDocsModel.js'

describe('TranslateDocsModel', () => {
	describe('Model-as-Schema (Static Fields)', () => {
		it('has static source with help, default and positional', () => {
			assert.equal(typeof TranslateDocsModel.source.help, 'string')
			assert.equal(TranslateDocsModel.source.default, 'docs/uk/**/*.md')
			assert.equal(TranslateDocsModel.source.positional, true)
		})

		it('has static target with help, default and positional', () => {
			assert.equal(typeof TranslateDocsModel.target.help, 'string')
			assert.equal(TranslateDocsModel.target.default, 'docs/en')
			assert.equal(TranslateDocsModel.target.positional, true)
		})

		it('has static from with help and default (non-positional)', () => {
			assert.equal(typeof TranslateDocsModel.from.help, 'string')
			assert.equal(TranslateDocsModel.from.default, 'uk')
			assert.equal(TranslateDocsModel.from.positional, undefined)
		})

		it('has static to with help and default (non-positional)', () => {
			assert.equal(typeof TranslateDocsModel.to.help, 'string')
			assert.equal(TranslateDocsModel.to.default, 'en_GB')
		})

		it('has static quiet with help, default and type', () => {
			assert.equal(typeof TranslateDocsModel.quiet.help, 'string')
			assert.equal(TranslateDocsModel.quiet.default, false)
			assert.equal(TranslateDocsModel.quiet.type, 'boolean')
		})
	})

	describe('Constructor & Defaults', () => {
		it('creates instance with all defaults when no data given', () => {
			const model = new TranslateDocsModel()
			assert.equal(model.source, 'docs/uk/**/*.md')
			assert.equal(model.target, 'docs/en')
			assert.equal(model.from, 'uk')
			assert.equal(model.to, 'en_GB')
			assert.equal(model.quiet, false)
		})

		it('overrides specified fields while keeping defaults for others', () => {
			const model = new TranslateDocsModel({ from: 'de', to: 'fr', quiet: true })
			assert.equal(model.source, 'docs/uk/**/*.md')
			assert.equal(model.target, 'docs/en')
			assert.equal(model.from, 'de')
			assert.equal(model.to, 'fr')
			assert.equal(model.quiet, true)
		})

		it('ignores undefined values in data (falls back to defaults)', () => {
			const model = new TranslateDocsModel({ from: undefined, to: 'es' })
			assert.equal(model.from, 'uk')
			assert.equal(model.to, 'es')
		})
	})

	describe('OLMUI Generator Contract', () => {
		it('has an async generator run() method', () => {
			const model = new TranslateDocsModel()
			assert.equal(typeof model.run, 'function')
		})

		it('yields warning log when no files match the glob', async () => {
			const model = new TranslateDocsModel({
				source: 'nonexistent/**/*.md',
				quiet: true,
			})
			const iter = model.run()
			const first = await iter.next()
			assert.equal(first.done, false)
			assert.equal(first.value.type, 'log')
			assert.equal(first.value.level, 'warning')
			assert.ok(first.value.message.includes('No files found'))

			const done = await iter.next()
			assert.equal(done.done, true)
			assert.equal(done.value.status, 'failed')
			assert.equal(done.value.reason, 'no_files')
		})
	})
})
