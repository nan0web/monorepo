import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { SpecRunner } from '@nan0web/ui/testing'
import { InspectPipelineModel } from '../src/domain/pipeline/pipelines/InspectPipelineModel.js'
import { AppPipelineModel } from '../src/domain/pipeline/pipelines/AppPipelineModel.js'
import { PipelineListModel } from '../src/domain/pipeline/PipelineApp.js'
import { DBFS } from '@nan0web/db-fs'
import { DB } from '@nan0web/db'
import path from 'node:path'

const registry = { InspectPipelineModel, PipelineListModel }

describe('Pipeline Stories', () => {
	it('inspect pipeline scenario', async () => {
		const rootDir = path.resolve(import.meta.dirname, '..')
		const db = new DB()
		await db.connect()
		
		await db.saveDocument('package.json', { name: '@nan0web/llimo.v3', private: true })
		await db.saveDocument('CONTRIBUTING.md', 'CONTRIBUTING')
		await db.saveDocument('LICENSE', 'ISC')
		await db.saveDocument('.editorconfig', 'editorconfig')
		await db.saveDocument('seed.md', 'seed content')
		await db.saveDocument('project.md', 'project content')

		await SpecRunner.executeFile(
			rootDir,
			'tests/uk/inspect-pipeline.story.nan0',
			'default', registry,
			{ db }
		)
	})

	it('pipeline list scenario', async () => {
		const rootDir = path.resolve(import.meta.dirname, '..')
		const db = new DBFS({ root: rootDir })
		await db.connect()
		await SpecRunner.executeFile(
			rootDir,
			'tests/uk/pipeline-list.story.nan0',
			'default', registry,
			{ db }
		)
	})

	it('should automatically heal pipeline errors via TDD loop', async () => {
		const tempDir = path.resolve(import.meta.dirname, 'temp_story_dir')
		const db = new DB()
		const dataDb = new DB()
		const localDb = new DBFS({ cwd: tempDir, root: 'local' })
		const chatDb = new DBFS({ cwd: tempDir, root: 'chat' })
		db.mount('@data', dataDb)
		db.mount('@local', localDb)
		db.mount('@chat', chatDb)
		await db.connect()
		await dataDb.connect()
		await localDb.connect()
		await chatDb.connect()
		
		// 1. Setup minimal repository workspace files
		await db.saveDocument('package.json', { name: 'test-app', private: true })
		await db.saveDocument('seed.md', 'Need to build simple CalcModel')
		await db.saveDocument('project.md', 'simple calc project')

		// 2. Setup mock configurations
		const mockPhases = {}
		for (const phase of ['1-seed', '2-model', '3-contract', '4-adapter', '5-ui-cli', '6-ui-chat', '7-ui-web', '8-ui-mobile', '9-qa']) {
			mockPhases[phase] = {
				workflows: ['init-project'],
				inspectors: [],
				instructions: `Phase ${phase} instructions`
			}
		}
		await db.saveDocument('@data/uk/pipelines/app', { phases: mockPhases })

		// 3. Mock AI streaming responses
		let aiCalls = 0
		const mockAi = {
			async streamText(modelInfo, messages) {
				aiCalls++
				if (aiCalls === 1) {
					// First response contains syntax error
					return {
						textStream: (async function* () {
							yield '---boundary:src/domain/CalcModel.js---\nconst x = 1;\n---boundary---\n'
						})(),
						usage: Promise.resolve({ promptTokens: 10, completionTokens: 20 })
					}
				} else {
					// Second response corrects it after receiving test failure
					return {
						textStream: (async function* () {
							yield '---boundary:src/domain/CalcModel.js---\nconst x = 2;\n---boundary---\n'
						})(),
						usage: Promise.resolve({ promptTokens: 10, completionTokens: 20 })
					}
				}
			}
		}

		// 4. Mock OS Executor execution loop
		let testRuns = 0
		const mockOs = {
			async exists() { return false },
			async readFile() { return '' },
			async writeFile() {},
			async executeCommand(cmd) {
				if (cmd.includes('test')) {
					testRuns++
					if (testRuns === 1) {
						// First test execution fails
						return { code: 1, stdout: 'fail: expected 2, got 1', stderr: '' }
					} else {
						// Second test execution passes
						return { code: 0, stdout: 'ok: expected 2, got 2', stderr: '' }
					}
				}
				return { code: 0, stdout: 'ok', stderr: '' }
			}
		}

		// 5. Instantiate AppPipelineModel with mock dependencies
		const pipeline = new AppPipelineModel(
			{ task: 'implement calc', name: 'app', autoVerify: true },
			{
				db,
				os: mockOs,
				ai: mockAi,
				t: (k) => k
			}
		)

		// 6. Run pipeline and verify that it healed itself
		let currentVal = null
		const gen = pipeline.run()
		while (true) {
			const { value, done } = await gen.next()
			if (done) {
				currentVal = value
				break
			}
		}

		assert.strictEqual(aiCalls, 2)
		assert.strictEqual(testRuns, 2)
		assert.strictEqual(currentVal.data.ok, true)

		// 7. Cleanup temp directory
		const { exec } = await import('node:child_process')
		await new Promise((resolve) => exec(`rm -rf ${tempDir}`, resolve))
	})
})
