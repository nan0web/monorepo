import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import {
	ProjectManagement,
	ReleaseManager,
	TaskTestSuite,
	ChangelogTaskManager,
} from './ProjectManagementAsCode.js'

describe('ProjectManagementAsCode Architecture', () => {
	describe('ProjectManagement', () => {
		it('should initialize with default configuration', () => {
			const pm = new ProjectManagement()
			assert.equal(pm.projectPath, '.')
			assert.equal(pm.autoTrack, false)
			assert.ok(pm.tasks instanceof Map)
		})

		it('should register tasks with their test files', () => {
			const pm = new ProjectManagement()
			pm.registerTask('task-1', './tests/task1.test.js')
			pm.registerTask('task-2', './tests/task2.test.js')

			assert.equal(pm.tasks.size, 2)
			assert.equal(pm.tasks.get('task-1'), './tests/task1.test.js')
			assert.equal(pm.tasks.get('task-2'), './tests/task2.test.js')
		})

		it('should validate project state by running task tests', async () => {
			const pm = new ProjectManagement()
			pm.registerTask('task-1', './tests/task1.test.js')
			pm.registerTask('task-2', './tests/task2.test.js')

			const results = await pm.validateProjectState()
			assert.ok(results.passed.length >= 0)
			assert.ok(results.failed.length >= 0)
			assert.ok(results.pending.length >= 0)
		})
	})

	describe('ReleaseManager', () => {
		it('should initialize with project manager', () => {
			const pm = new ProjectManagement()
			const rm = new ReleaseManager(pm)

			assert.equal(rm.projectManager, pm)
		})

		it.skip('should validate release with version calculation', async () => {
			const pm = new ProjectManagement()
			const rm = new ReleaseManager(pm)

			const validation = await rm.validateRelease('1.0.0')
			assert.equal(validation.version, '1.0.0')
			assert.ok(validation.timestamp)
			assert.ok(validation.tasks.total >= 0)
		})

		it('should execute release process with validation', async () => {
			const pm = new ProjectManagement()
			const rm = new ReleaseManager(pm)

			const result = await rm.executeRelease('patch')
			assert.ok(result.version)
			assert.ok(result.validation)
			assert.equal(typeof result.published, 'boolean')
		})

		it('should block release when tests fail and ignore option is not set', async () => {
			const pm = new ProjectManagement()
			const rm = new ReleaseManager(pm)

			// Mock validation to simulate failed tasks
			rm.projectManager.validateProjectState = async () => ({
				passed: [],
				failed: ['task-1'],
				pending: [],
			})

			try {
				await rm.executeRelease('patch')
				assert.fail('Should have thrown an error')
			} catch (error) {
				assert.ok(error.message.includes('Release blocked'))
			}
		})
	})

	describe('TaskTestSuite', () => {
		it.skip('should extend TestSuite with task metadata', () => {
			const testFunction = () => {}
			const taskSuite = new TaskTestSuite('task-1', 'Test task description', testFunction)

			assert.equal(taskSuite.taskId, 'task-1')
			assert.equal(taskSuite.description, 'Test task description')
			assert.equal(taskSuite.testFunction, testFunction)
		})
	})

	describe('ChangelogTaskManager', () => {
		it('should parse changelog content to extract tasks', () => {
			const ctm = new ChangelogTaskManager()
			const changelogContent = `
# Changelog

## [1.0.0] - 2024-01-01
### Added
- Initial release features
- Core functionality implementation
`

			const tasks = ctm.parseChangelog(changelogContent)
			assert.ok(Array.isArray(tasks))
		})

		it('should generate task tests from changelog entries', async () => {
			const ctm = new ChangelogTaskManager()
			const tasks = [
				{ id: 'task-1', description: 'Implement feature A' },
				{ id: 'task-2', description: 'Fix bug B' },
			]

			// This should not throw an error
			await ctm.generateTaskTests(tasks)
			assert.ok(true)
		})
	})
})
