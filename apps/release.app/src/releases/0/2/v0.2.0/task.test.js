import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import DBFS from '@nan0web/db-fs'
import { ReleaseAuditor } from '@nan0web/release/domain/inspect/ReleaseAuditor'
import { CheckCommand } from '@nan0web/release/domain/CheckCommand'
import { AuditorModel } from '@nan0web/inspect'

describe('Release v0.2.0 Contract: ReleaseAuditor & CheckCommand', () => {
	it('ReleaseAuditor should inherit from AuditorModel and detect missing release files', async () => {
		assert.ok(ReleaseAuditor)
		assert.ok(Object.prototype.isPrototypeOf.call(AuditorModel, ReleaseAuditor))

		const db = new DB({
			predefined: [
				['apps/demo/package.json', { name: 'demo', version: '1.0.0' }],
				['apps/demo/releases/1/0/v1.0.0/dummy.txt', 'test'],
			],
		})
		await db.connect()

		const auditor = new ReleaseAuditor({ dir: 'apps/demo' }, { db })
		await auditor.init()
		assert.equal(typeof auditor.run, 'function')

		const gen = auditor.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.equal(res.success, false)
		assert.ok(res.errors.length > 0)
	})

	it('CheckCommand should run ReleaseAuditor and produce structured diagnostic output', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'apps/valid\n'],
				['apps/valid/package.json', { name: 'valid', version: '1.0.0' }],
				['apps/valid/releases/1/0/v1.0.0/release.md', '# Release\n- [x] Task'],
				['apps/valid/releases/1/0/v1.0.0/user.md', 'Hours: 2.0h\nIterations: 3\nRRS: 330'],
				['apps/valid/releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		const cmd = new CheckCommand({ target: 'apps/valid' }, { db })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.ok(res.success)
		assert.equal(res.diagnostics.length, 0)
	})

	it('ReleaseAuditor should support --changed option to only inspect modified workspaces', async () => {
		const auditor = new ReleaseAuditor({ changed: true }, {})
		assert.equal(auditor.changed, true)
	})

	it('ReleaseAuditor gracefully skips when capped by active session', async () => {
		const db = new DB({
			predefined: [
				['.agent/active_session.json', { disabledInspectors: ['release'] }],
				['apps/demo/package.json', { name: 'demo' }],
			],
		})
		await db.connect()

		const auditor = new ReleaseAuditor({ dir: 'apps/demo' }, { db })
		await auditor.init()
		const gen = auditor.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}
		const res = step.value?.data || step.value
		assert.ok(res.skipped)
	})

	it('OLMUI Contract: DashboardModel provides pure data-driven summary and entries independent of DOM', async () => {
		const { DashboardModel } = await import('@nan0web/release')
		assert.ok(DashboardModel)

		const db = new DB({
			predefined: [
				['releases.txt', 'packages/sample\n'],
				['packages/sample/package.json', { name: '@nan0web/sample', version: '1.0.0' }],
				['packages/sample/releases/1/0/v1.0.0/release.md', '# v1.0.0\n- [x] Done task\n- [ ] Todo task'],
				['packages/sample/releases/1/0/v1.0.0/user.md', 'Hours: 3h\nIterations: 5\nRRS: 330'],
				['packages/sample/releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		const model = new DashboardModel({ registryFile: 'releases.txt' }, { db })
		const data = await model.aggregate()

		assert.ok(data.summary)
		assert.equal(data.summary.totalProjects, 1)
		assert.equal(data.projects.length, 1)
		assert.equal(data.projects[0].name, '@nan0web/sample')
		assert.equal(data.projects[0].tasks.length, 2)
	})
})

