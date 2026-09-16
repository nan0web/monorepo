import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { runGenerator } from '@nan0web/ui'
import { ReleaseApp } from './ReleaseApp.js'
import { StatusCommand } from '../StatusCommand.js'

describe('ReleaseApp OLMUI Scenario & CLI Controller', () => {
	it('instantiates ReleaseApp with default StatusCommand', () => {
		const app = new ReleaseApp()
		assert.ok(app)
		assert.equal(ReleaseApp.alias, 'release-app')
	})

	it('executes StatusCommand and yields formatted release metrics', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'packages/core\napps/web\n'],
				['packages/core/package.json', { name: '@nan0web/core', version: '1.0.0' }],
				[
					'packages/core/releases/1/0/v1.0.0/user.md',
					'# User Metrics\nВитрачений час: 4.5 год\nКількість ітерацій: 12\nRRS: 340',
				],
				['packages/core/releases/1/0/v1.0.0/release.md', '# Release\n## Section\n- [x] Task 1\n- [ ] Task 2'],
				['packages/core/releases/1/0/v1.0.0/task.spec.js', '// specs'],
				['apps/web/package.json', { name: 'web.app', version: '0.2.0' }],
				['apps/web/releases/0/2/v0.2.0/user.md', '# User Metrics\nВитрачений час: 2.0 год\nКількість ітерацій: 5\nRRS: 350'],
				['apps/web/releases/0/2/v0.2.0/release.md', '# Release\n- [x] Web Task 1'],
				['apps/web/releases/0/2/v0.2.0/task.test.js', '// closed tests'],
			],
		})
		await db.connect()

		const statusCmd = new StatusCommand({}, { db })
		/** @type {string[]} */
		const logs = []

		const res = await runGenerator(statusCmd.run(), {
			ask: async () => ({ value: {} }),
			show: (intent) => logs.push(intent.message || intent.value || ''),
			progress: () => {},
		})

		assert.equal(res.status, 'ok')
		assert.equal(res.summary.totalProjects, 2)
		assert.equal(res.summary.wipCount, 1)
		assert.equal(res.summary.closedCount, 1)
		assert.equal(res.summary.totalHours, 6.5)
		assert.equal(res.summary.totalIterations, 17)

		// Verify that formatted log messages were emitted
		assert.ok(logs.some((msg) => msg.includes('@nan0web/core') && msg.includes('WIP')))
		assert.ok(logs.some((msg) => msg.includes('web.app') && msg.includes('CLOSED')))
		assert.ok(logs.some((msg) => msg.includes('Total Projects: 2')))
	})

	it('runs StatusCommand through ReleaseApp controller delegation', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'packages/sample\n'],
				['packages/sample/package.json', { name: 'sample', version: '1.0.0' }],
			],
		})
		await db.connect()

		const app = new ReleaseApp({ command: new StatusCommand({}, { db }) }, { db })
		/** @type {string[]} */
		const logs = []

		const res = await runGenerator(app.run(), {
			ask: async () => ({ value: {} }),
			show: (intent) => logs.push(intent.message || intent.value || ''),
			progress: () => {},
		})

		assert.equal(res.status, 'ok')
		assert.equal(res.summary.totalProjects, 1)
	})
})
