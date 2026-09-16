import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { ReleaseAuditor } from './ReleaseAuditor.js'
import { AuditorModel } from '@nan0web/inspect'

describe('ReleaseAuditor OLMUI Scenario & Architecture Auditor', () => {
	it('inherits from AuditorModel and has release alias', () => {
		assert.equal(ReleaseAuditor.alias, 'release')
		assert.ok(Object.prototype.isPrototypeOf.call(AuditorModel, ReleaseAuditor))
	})

	it('successfully audits a valid release structure without diagnostics errors', async () => {
		const pkgJson = { name: '@nan0web/sample-pkg', version: '1.0.0' }
		const releaseMd = `# v1.0.0 - 2026-09-01
## Tasks
- [x] Done task
`
		const userMd = `---
name: user-feedback
version: 1.0.0
---
## ⏱ 1. Метрики Виконання
- **Витрачений час розробки (Годин):** \`4.5h\`
- **Кількість ітерацій (Test Runs / Refactors):** \`10\`
- **Фінальний бал RRS (Release Readiness Score):** \`324\`
`
		const taskSpec = `import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
describe('contract', () => {
	it('passes', () => assert.ok(true))
})
`
		const db = new DB({
			predefined: [
				['packages/sample-pkg/package.json', pkgJson],
				['packages/sample-pkg/releases/1/0/v1.0.0/release.md', releaseMd],
				['packages/sample-pkg/releases/1/0/v1.0.0/user.md', userMd],
				['packages/sample-pkg/releases/1/0/v1.0.0/task.spec.js', taskSpec],
			],
		})
		await db.connect()

		const auditor = new ReleaseAuditor({ dir: 'packages/sample-pkg' }, { db })
		await auditor.init()

		const gen = auditor.run()
		let step = await gen.next()
		const intents = []
		while (!step.done) {
			intents.push(step.value)
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.ok(res.success)
		assert.equal(res.errors.length, 0)
		assert.equal(res.checkedReleases.length, 1)
	})

	it('detects missing release documents, user.md, and contract files with actionable diagnostics', async () => {
		const pkgJson = { name: '@nan0web/broken-pkg', version: '2.0.0' }
		const db = new DB({
			predefined: [
				['packages/broken-pkg/package.json', pkgJson],
				['packages/broken-pkg/releases/2/0/v2.0.0/dummy.txt', 'empty'],
			],
		})
		await db.connect()

		const auditor = new ReleaseAuditor({ dir: 'packages/broken-pkg' }, { db })
		await auditor.init()

		const gen = auditor.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.equal(res.success, false)
		assert.ok(res.errors.length >= 2)

		const codes = res.errors.map((e) => e.code || e.check)
		assert.ok(codes.includes('MISSING_RELEASE_MD') || codes.includes('release.md'))
		assert.ok(codes.includes('MISSING_CONTRACT') || codes.includes('task.spec.js'))
	})

	it('detects ambiguous contracts when both task.spec.js and task.test.js exist', async () => {
		const db = new DB({
			predefined: [
				['packages/ambig/package.json', { name: '@nan0web/ambig', version: '1.0.0' }],
				['packages/ambig/releases/1/0/v1.0.0/release.md', '# Release\n- [ ] Task'],
				['packages/ambig/releases/1/0/v1.0.0/user.md', 'Hours: 1.0h\nIterations: 2\nRRS: 300'],
				['packages/ambig/releases/1/0/v1.0.0/task.spec.js', '// spec'],
				['packages/ambig/releases/1/0/v1.0.0/task.test.js', '// test'],
			],
		})
		await db.connect()

		const auditor = new ReleaseAuditor({ dir: 'packages/ambig' }, { db })
		await auditor.init()

		const gen = auditor.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.equal(res.success, false)
		const codes = res.errors.map((e) => e.code || e.check)
		assert.ok(codes.includes('AMBIGUOUS_CONTRACTS') || codes.includes('contracts'))
	})

	it('skips execution gracefully if auditor is capped by active session', async () => {
		const db = new DB({
			predefined: [
				['.agent/active_session.json', { disabledInspectors: ['release'] }],
				['packages/any/package.json', { name: 'any' }],
			],
		})
		await db.connect()

		const auditor = new ReleaseAuditor({ dir: 'packages/any' }, { db })
		await auditor.init()

		const gen = auditor.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}
		const res = step.value?.data || step.value
		assert.ok(res.skipped)
	})
})
