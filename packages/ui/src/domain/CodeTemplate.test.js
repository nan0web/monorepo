import { describe, it } from 'node:test'
import assert from 'node:assert'
import { CodeTemplate } from './CodeTemplate.js'

describe('CodeTemplate Model', () => {
	it('has static schema properties for prefix and suffix', () => {
		assert.strictEqual(CodeTemplate.prefix.default, '%%')
		assert.strictEqual(CodeTemplate.suffix.default, '%%')
	})

	it('compiles template with default %% replacement tags', async () => {
		const template = `/**
 * @replace title
 * Replace document title
 */
const title = 'Original Title'
/** @replace */
`
		const app = new CodeTemplate({
			template,
			input: {
				title: "const title = 'Updated Title'",
			},
		})

		const intent = await app.run().next()
		assert.ok(intent.value.data.output.includes("const title = 'Updated Title'"))
		assert.ok(!intent.value.data.output.includes("const title = 'Original Title'"))
	})

	it('supports custom prefix and suffix delimiters', async () => {
		const template = `/**
 * @replace content
 */
const body = 'Hello'
/** @replace */
`
		const app = new CodeTemplate({
			template,
			prefix: '$$',
			suffix: '$$',
			input: {
				content: "const body = 'World'",
			},
		})

		const intent = await app.run().next()
		assert.ok(intent.value.data.output.includes("const body = 'World'"))
	})

	it('processes multiple @replace blocks in single template', async () => {
		const template = `/**
 * @replace imports
 */
import { A } from './A.js'
/** @replace */

/**
 * @replace config
 */
const config = { mode: 'dev' }
/** @replace */
`
		const app = new CodeTemplate({
			template,
			input: {
				imports: "import { B } from './B.js'",
				config: "const config = { mode: 'prod' }",
			},
		})

		const intent = await app.run().next()
		const output = intent.value.data.output
		assert.ok(output.includes("import { B } from './B.js'"))
		assert.ok(output.includes("const config = { mode: 'prod' }"))
		assert.ok(!output.includes("import { A } from './A.js'"))
		assert.ok(!output.includes("const config = { mode: 'dev' }"))
	})

	it('loads templateFile using @cwd database mount when template is empty', async () => {
		const loadedContent = `/**
 * @replace body
 */
const x = 1
/** @replace */
`
		const mockCwdDb = {
			loadDocumentAs: async (ext, file) => {
				assert.strictEqual(ext, '.txt')
				assert.strictEqual(file, 'my-template.js')
				return loadedContent
			},
		}

		const mockDb = {
			getMount: (prefix) => (prefix === '@cwd' ? mockCwdDb : null),
		}

		const app = new CodeTemplate(
			{
				templateFile: 'my-template.js',
				input: {
					body: 'const x = 100',
				},
			},
			{ db: mockDb }
		)

		const intent = await app.run().next()
		assert.ok(intent.value.data.output.includes('const x = 100'))
	})

	it('handles multiline /** @replace */ tags', async () => {
		const template = `/**
		 * @replace greeting
		 * This is a multiline
		 * replacement block
		 */
		const msg = 'Hello'
		/** @replace */
		`
		const app = new CodeTemplate({
			template,
			input: {
				greeting: "const msg = 'Hi'",
			},
		})

		const intent = await app.run().next()
		assert.ok(intent.value.data.output.includes("const msg = 'Hi'"))
	})

	it('handles unclosed @replace tags by keeping original content', async () => {
		const template = `/**
		 * @replace welcome
		 */
		const text = 'Default'
		`
		const app = new CodeTemplate({
			template,
			input: {
				welcome: "const text = 'Replaced'",
			},
		})

		const intent = await app.run().next()
		// When @replace has no closing tag, the entire remaining content is kept as-is
		// Note: prettier may reformat single quotes to double quotes
		assert.ok(
			intent.value.data.output.includes('const text =') &&
				(intent.value.data.output.includes("'Default'") ||
					intent.value.data.output.includes('"Default"'))
		)
		assert.ok(intent.value.data.output.includes('@replace welcome'))
	})

	it('throws Error when templateFile is missing and no database available', async () => {
		const app = new CodeTemplate(
			{
				templateFile: 'nonexistent.js',
				input: { body: 'test' },
			},
			{ db: null }
		)

		await assert.rejects(
			async () => {
				const intent = await app.run().next()
				return intent
			},
			{ message: /No database available/ }
		)
	})
})
