import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { TaskIntent } from './TaskIntent.js'
import { DB } from '@nan0web/db'

describe('TaskIntent Scenario (Story)', () => {
	it('parses frontmatter and scope correctly from markdown string', () => {
		const md = `---
version: 3.3.0
type: feature
status: active
---

# 🚀 Mission: Build Task Intent

## 🎯 Scope
1. Implement TaskIntent
2. Add story tests
`
		const taskIntent = new TaskIntent({ file: 'task.md' })
		const parsed = taskIntent.parseTask(md)

		assert.equal(parsed.version, '3.3.0')
		assert.equal(parsed.type, 'feature')
		assert.equal(parsed.title, '🚀 Mission: Build Task Intent')
		assert.equal(parsed.tasks.length, 2)
		assert.equal(parsed.tasks[0], '1. Implement TaskIntent')
	})

	it('executes in dry-run mode when requested without spawning external agents', async () => {
		const taskIntent = new TaskIntent({ file: 'task.md', agent: 'none' })
		const events = []
		for await (const ev of taskIntent.run()) {
			events.push(ev)
		}
		assert.ok(events.length > 0)
	})
})
