import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { generateSystemPrompt } from '../../../llm/system.js'
import WorkflowCommand from '../../../llm/commands/WorkflowCommand.js'

describe('Orchestration and Workflow Command Contract', () => {

	test('System Prompt must automatically inject workflows index from alias', async () => {
		const prompt = await generateSystemPrompt()
		assert.ok(prompt.includes('## Доступні шаблони (Workflows)'), 'Must include Workflow sections')
		// The environment might not have .llimorc @workflow matching the test env perfectly, but it should not crash.
		// However, it should include <!--WORKFLOWS_INDEX--> logic which was resolved (either populated or empty).
		assert.equal(prompt.includes('<!--WORKFLOWS_INDEX-->'), false, 'Should have replaced the placeholder')
	})

	test('WorkflowCommand correctly yields markdown alerts for workflow files', async () => {
		const cmd = new WorkflowCommand({
			cwd: '/mock',
			parsed: {
				correct: [
					{ filename: '@workflow', content: 'code-style.md\narchitechnomag.md', label: '', type: 'code', encoding: 'utf-8' }
				]
			}
		})
		
		const results = []
		for await (const alert of cmd.run()) {
			results.push(String(alert))
		}
		
		assert.equal(results.length, 2)
		assert.ok(results[0].includes('- [](@workflow/code-style.md)'))
		assert.ok(results[1].includes('- [](@workflow/architechnomag.md)'))
	})
})
