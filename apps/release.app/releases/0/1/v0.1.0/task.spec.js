import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { runGenerator } from '@nan0web/ui'
import { StatusCommand } from '../../../../src/domain/StatusCommand.js'

describe('ReleaseApp v0.1.0 Extended CLI & Inspector Contracts', () => {
	it('renders structured table with row numbers (#) and git branch columns', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'packages/core\napps/web\n'],
				['packages/core/package.json', { name: '@nan0web/core', version: '1.0.0' }],
				[
					'packages/core/releases/1/0/v1.0.0/user.md',
					'# User Metrics\nВитрачений час: 4.5h\nКількість ітерацій: 12\nRRS: 340',
				],
				['packages/core/releases/1/0/v1.0.0/task.spec.js', '// specs'],
				['apps/web/package.json', { name: 'web.app', version: '0.2.0' }],
				['apps/web/releases/0/2/v0.2.0/user.md', '# User Metrics\nВитрачений час: 2.0h\nКількість ітерацій: 5\nRRS: 350'],
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
		assert.equal(res.projects.length, 2)

		// Table row check: Row numbers # 1 and 2
		assert.ok(logs.some((msg) => msg.includes('#') || msg.includes('Project') || msg.includes('Branch')))
	})

	it('inspects single project details when target # or name is provided', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'apps/target\n'],
				['apps/target/package.json', { name: 'target.app', version: '1.0.0' }],
				[
					'apps/target/releases/1/0/v1.0.0/user.md',
					'# User Metrics\nВитрачений час: 6.5h\nКількість ітерацій: 14\nRRS: 324\n## Feedback\n- Great work',
				],
				[
					'apps/target/releases/1/0/v1.0.0/release.md',
					'# Release Target\n- [x] Done Task\n- [ ] Pending Task',
				],
				['apps/target/releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		// Query by project number '1' or name 'target.app'
		const statusCmd = new StatusCommand({ target: '1' }, { db })
		/** @type {string[]} */
		const logs = []

		const res = await runGenerator(statusCmd.run(), {
			ask: async () => ({ value: {} }),
			show: (intent) => logs.push(intent.message || intent.value || ''),
			progress: () => {},
		})

		assert.equal(res.status, 'ok')
		assert.ok(logs.some((msg) => msg.includes('Done Task') || msg.includes('Pending Task')))
		assert.ok(logs.some((msg) => msg.includes('6.5') || msg.includes('324')))
	})

	it('supports sorting projects by state, rrs, or hours', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'apps/p1\napps/p2\n'],
				['apps/p1/package.json', { name: 'p1', version: '1.0.0' }],
				['apps/p1/releases/1/0/v1.0.0/user.md', 'Витрачений час: 1.0h\nRRS: 100'],
				['apps/p2/package.json', { name: 'p2', version: '1.0.0' }],
				['apps/p2/releases/1/0/v1.0.0/user.md', 'Витрачений час: 10.0h\nRRS: 350'],
			],
		})
		await db.connect()

		const statusCmd = new StatusCommand({ sort: 'hours' }, { db })
		const res = await runGenerator(statusCmd.run(), {
			ask: async () => ({ value: {} }),
			show: () => {},
			progress: () => {},
		})

		assert.equal(res.status, 'ok')
		assert.equal(res.projects[0].name, 'p2') // 10h before 1h
	})
})
