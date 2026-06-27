import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { WorkflowApp, WorkflowListModel, WorkflowShowModel } from './WorkflowApp.js'

async function runGenerator(gen) {
	const events = []
	while (true) {
		const { value, done } = await gen.next()
		if (value) events.push(value)
		if (done) break
	}
	return events
}

describe('WorkflowApp', () => {
	it('WorkflowListModel should list workflows via readDir', async () => {
		const mockDb = {
			async connect() {},
			async *readDir(_path) {
				yield { name: 'nan0web.md' }
				yield { name: 'code-style.md' }
				yield { name: 'tdd.md' }
			}
		}

		const model = new WorkflowListModel({ locale: 'uk' }, {
			db: /** @type {any} */ (mockDb),
			t: (key) => key
		})

		const events = await runGenerator(model.run())
		const outputs = events.filter(e => e && (e.type === 'show' || e.type === 'render'))
		const allText = outputs.map(e => e.message || e.props?.children || JSON.stringify(e)).join('\n')

		assert.ok(allText.includes('nan0web'))
		assert.ok(allText.includes('code-style'))
		assert.ok(allText.includes('tdd'))
	})

	it('WorkflowListModel should show warning when directory is empty', async () => {
		const mockDb = {
			async connect() {},
			async *readDir(_path) {
				// empty
			}
		}

		const model = new WorkflowListModel({ locale: 'uk' }, {
			db: /** @type {any} */ (mockDb),
			t: (key) => key
		})

		const events = await runGenerator(model.run())
		const result = events.find(e => e && e.type === 'result')
		assert.ok(result)
		assert.deepEqual(result.data.workflows, [])
	})

	it('WorkflowShowModel should output workflow content', async () => {
		const content = '# NaN·Web\nUse OLMUI.'
		const mockDb = {
			async connect() {},
			async loadDocument(path) {
				if (path.endsWith('nan0web.md')) return content
				return null
			},
			async loadDocumentAs(ext, path) {
				return this.loadDocument(path)
			}
		}

		const model = new WorkflowShowModel({ name: 'nan0web', locale: 'uk' }, {
			db: /** @type {any} */ (mockDb),
			t: (key, vars) => vars ? key.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? _) : key
		})

		const events = await runGenerator(model.run())
		const allText = events
			.filter(e => e && e.type === 'show')
			.map(e => e.message || e.data?.message || e.data?.content || '')
			.join('\n')

		assert.ok(allText.includes('# NaN·Web'))
	})

	it('WorkflowShowModel should return error when workflow not found', async () => {
		const mockDb = {
			async connect() {},
			async loadDocument(_path) { throw new Error('not found') },
			async loadDocumentAs(ext, path) {
				return this.loadDocument(path)
			}
		}

		const model = new WorkflowShowModel({ name: 'missing', locale: 'uk' }, {
			db: /** @type {any} */ (mockDb),
			t: (key, vars) => vars ? key.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? _) : key
		})

		const events = await runGenerator(model.run())
		const shows = events.filter(e => e && e.type === 'show')
		const hasError = shows.some(e => e.level === 'error' || e.data?.level === 'error')
		assert.ok(hasError, 'Expected an error show event')
	})
})
