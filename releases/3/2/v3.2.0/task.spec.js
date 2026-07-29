import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

test('Release v3.2.0: Model-as-Schema for WorkspaceInspectorModel & BatchTaskModel', async (t) => {
	await t.test('WorkspaceInspectorModel should validate static fields and options', async () => {
		let WorkspaceInspectorModel
		try {
			const mod = await import('../../../../packages/ai/src/domain/WorkspaceInspectorModel.js')
			WorkspaceInspectorModel = mod.WorkspaceInspectorModel
		} catch (e) {
			assert.fail('WorkspaceInspectorModel.js does not exist yet: ' + e.message)
		}

		const inspector = new WorkspaceInspectorModel({
			name: 'i18n',
			type: 'deterministic',
			command: 'pnpm run inspect:i18n'
		})

		assert.equal(inspector.name, 'i18n')
		assert.equal(inspector.type, 'deterministic')
		assert.equal(inspector.command, 'pnpm run inspect:i18n')
	})

	await t.test('BatchTaskModel should validate input structure from JSONL line', async () => {
		let BatchTaskModel
		try {
			const mod = await import('../../../../packages/ai/src/domain/BatchTaskModel.js')
			BatchTaskModel = mod.BatchTaskModel
		} catch (e) {
			assert.fail('BatchTaskModel.js does not exist yet: ' + e.message)
		}

		const task = new BatchTaskModel({
			id: 'task_1',
			task: 'cnai:refactor',
			context: { targetFile: 'index.js' }
		})

		assert.equal(task.id, 'task_1')
		assert.equal(task.task, 'cnai:refactor')
		assert.deepEqual(task.context, { targetFile: 'index.js' })
	})
})

test('Release v3.2.0: Dynamic Discovery Registry & Batch Queue Execution', async (t) => {
	await t.test('Discovery scanner should scan mock directory with nan0web.nan0 files', async () => {
		let scanRegistry
		try {
			const mod = await import('../../../../packages/ai/src/domain/discovery.js')
			scanRegistry = mod.scanRegistry
		} catch (e) {
			assert.fail('discovery.js does not exist yet: ' + e.message)
		}

		const mockDir = path.resolve('./tmp/test-discovery')
		await fs.mkdir(mockDir, { recursive: true })
		await fs.writeFile(
			path.join(mockDir, 'nan0web.nan0'),
			JSON.stringify({
				name: 'mock-package',
				validators: {
					'mock-i18n': {
						type: 'deterministic',
						command: 'node run-mock-i18n.js'
					}
				}
			})
		)

		try {
			const registry = await scanRegistry(mockDir)
			const mockVal = registry.get('mock-i18n')
			assert.ok(mockVal)
			assert.equal(mockVal.command, 'node run-mock-i18n.js')
			assert.equal(mockVal.type, 'deterministic')
		} finally {
			await fs.rm(mockDir, { recursive: true, force: true })
		}
	})

	await t.test('Batch queue runner should process JSONL commands and output results', async () => {
		let runBatchQueue
		try {
			const mod = await import('../../../../packages/ai/src/domain/batch.js')
			runBatchQueue = mod.runBatchQueue
		} catch (e) {
			assert.fail('batch.js does not exist yet: ' + e.message)
		}

		const queueFile = path.resolve('./tmp/test-queue.jsonl')
		const resultsFile = path.resolve('./tmp/test-results.jsonl')

		const jsonlContent = [
			JSON.stringify({ id: 't1', task: 'mock-task', context: {} }),
			JSON.stringify({ id: 't2', task: 'mock-task', context: {} })
		].join('\n')

		await fs.mkdir(path.dirname(queueFile), { recursive: true })
		await fs.writeFile(queueFile, jsonlContent, 'utf8')

		try {
			const executor = async (task) => ({ success: true, id: task.id })
			await runBatchQueue(queueFile, resultsFile, executor)

			const resultsContent = await fs.readFile(resultsFile, 'utf8')
			const lines = resultsContent.split('\n').filter((l) => l.trim())
			assert.equal(lines.length, 2)

			const r1 = JSON.parse(lines[0])
			const r2 = JSON.parse(lines[1])
			assert.equal(r1.id, 't1')
			assert.ok(r1.success)
		} finally {
			await fs.rm(queueFile, { force: true })
			await fs.rm(resultsFile, { force: true })
		}
	})
})
