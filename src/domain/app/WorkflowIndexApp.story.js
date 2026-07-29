import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { WorkflowIndexApp } from './WorkflowIndexApp.js'

describe('WorkflowIndexApp', () => {
	it('should read md files from docs/uk/workflows and generate README.md index', async () => {
		const db = new DB()
		await db.saveDocument('docs/uk/workflows/test-workflow.md', '---\ndescription: "This is a test workflow"\n---\n# Test Workflow\n\nContent here.')
		await db.saveDocument('docs/uk/workflows/another-workflow.md', '# Title\nJust a test without description tag.')
		await db.saveDocument('docs/uk/workflows/README.md', 'old content')
        
		const app = new WorkflowIndexApp({}, { db, t: (k, vars) => {
			if (!vars) return k
			let res = k
			for (const [key, val] of Object.entries(vars)) {
				res = res.replace(`{${key}}`, val)
			}
			return res
		} })
		
		const events = []
		for await (const intent of app.run()) {
			events.push(intent)
		}

		// It should emit progress and result
		assert.ok(events.length > 0)
		
		// Verify DB changes
		const readme = await db.loadDocumentAs('.txt', 'docs/uk/workflows/README.md')
		assert.ok(typeof readme === 'string', 'README content should be a string')
		assert.ok(readme.includes('test-workflow.md'), 'Missing test-workflow.md in README')
		assert.ok(readme.includes('This is a test workflow'), 'Missing description in README')
		assert.ok(readme.includes('another-workflow.md'), 'Missing another-workflow.md in README')
		assert.ok(readme.includes('Title'), 'Fallback title not picked up')
	})
})
