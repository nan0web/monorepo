import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { PipelineApp } from './PipelineApp.js'
import DB from '@nan0web/db'

describe('PipelineApp Story / Unit Tests', () => {
	it('should parse pipeline.md and execute steps sequentially', async () => {
		const pipelineContent = `# Test Pipeline

## First Step
Some description
\`\`\`bash
echo "Hello from step 1"
\`\`\`

## Second Step
Another description
\`\`\`bash
echo "Hello from step 2"
\`\`\`
`
		const predefined = [['pipeline.md', pipelineContent]]
		const mockFs = new DB({ predefined })
		await mockFs.connect()

		const executedCommands = []
		const runner = new PipelineApp(
			{ file: 'pipeline.md' },
			{
				workspaceDb: mockFs,
				workspaceRoot: '/',
				executor: async (cmd, step) => {
					executedCommands.push({ cmd, step: step.name })
					return {
						status: 'passed',
						output: `Executed: ${cmd}`,
						usage: { totalTokens: 100 },
						cost: { money: 0.001, time: 0.5, valuta: 'USD' },
						files: ['src/file1.js'],
					}
				},
			}
		)

		const events = []
		for await (const ev of runner.run()) {
			events.push(ev)
		}

		assert.strictEqual(executedCommands.length, 2, 'Should execute 2 steps')
		assert.strictEqual(executedCommands[0].step, 'First Step')
		assert.match(executedCommands[0].cmd, /echo "Hello from step 1"/)
		assert.strictEqual(executedCommands[1].step, 'Second Step')
		assert.match(executedCommands[1].cmd, /echo "Hello from step 2"/)

		const resultEv = events.find((e) => e.type === 'result')
		assert.ok(resultEv, 'Should produce a result summary')
		assert.strictEqual(resultEv.data.status, 'passed')
		assert.strictEqual(resultEv.data.totalCost.money, 0.002)
		assert.strictEqual(resultEv.data.totalUsage.totalTokens, 200)

		await mockFs.disconnect()
	})

	it('should stop pipeline immediately if a step fails', async () => {
		const pipelineContent = `# Failing Pipeline

## Step One
\`\`\`bash
exit 0
\`\`\`

## Failing Step
\`\`\`bash
exit 1
\`\`\`

## Never Reached Step
\`\`\`bash
echo "never"
\`\`\`
`
		const predefined = [['pipeline.md', pipelineContent]]
		const mockFs = new DB({ predefined })
		await mockFs.connect()

		const executed = []
		const runner = new PipelineApp(
			{ file: 'pipeline.md' },
			{
				workspaceDb: mockFs,
				workspaceRoot: '/',
				executor: async (cmd, step) => {
					executed.push(step.name)
					if (step.name === 'Failing Step') {
						return {
							status: 'failed',
							error: 'Command exited with code 1',
						}
					}
					return { status: 'passed' }
				},
			}
		)

		const events = []
		for await (const ev of runner.run()) {
			events.push(ev)
		}

		assert.strictEqual(executed.length, 2, 'Should stop after second step fails')
		assert.deepStrictEqual(executed, ['Step One', 'Failing Step'])

		const errEv = events.find((e) => e.type === 'show' && e.level === 'error')
		assert.ok(errEv, 'Should report error for failed step')

		await mockFs.disconnect()
	})
})
