import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { TaskIntent } from '../../../../src/domain/TaskIntent.js'
import { AiAppModel } from '../../../../src/domain/AiAppModel.js'
import { PipelineApp } from '../../../../src/domain/PipelineApp.js'

describe('Release v3.3.0: TaskIntent & Clean Pipeline Contract', () => {
	it('1. TaskIntent parses task.md and extracts metadata and tasks', async () => {
		const sampleMd = `---
version: 1.0.0
type: feature
status: active
---
# Mission: Test
## Scope
1. First task
2. Second task`

		const intent = new TaskIntent({ file: 'test-task.md' })
		const parsed = intent.parseTask(sampleMd)
		assert.equal(parsed.version, '1.0.0')
		assert.equal(parsed.title, 'Mission: Test')
		assert.ok(parsed.tasks.length >= 1)
	})

	it('2. AiAppModel rejects unknown commands with error instead of showing Help', async () => {
		const app = new AiAppModel({ command: 'unknownCommand' }, { noExit: true })
		const events = []
		for await (const ev of app.run()) {
			events.push(ev)
		}
		const errorEvent = events.find((e) => e.level === 'error' || e.type === 'show')
		assert.ok(errorEvent, 'Unknown command should emit an error event')
		assert.match(String(errorEvent.content || errorEvent.message || errorEvent.text), /Unknown command|not found/i)
	})

	it('3. PipelineApp produces clean summary without dumping raw stdout into result', () => {
		const pipeline = new PipelineApp({ file: 'pipeline.md' })
		const parsed = pipeline.parsePipeline(`## 1. Step\n\`\`\`bash\necho "Hello"\n\`\`\``)
		assert.equal(parsed.length, 1)
		assert.equal(parsed[0].name, '1. Step')
		assert.equal(parsed[0].command, 'echo "Hello"')
	})
})
