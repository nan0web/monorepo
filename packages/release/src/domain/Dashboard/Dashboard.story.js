import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { DashboardModel } from './DashboardModel.js'

describe('DashboardModel OLMUI Scenario', () => {
	it('aggregates projects, computes summary metrics and RRS readiness', async () => {
		const rawReleasesTxt = `# Registry
packages/sample-pkg
apps/sample-app
`
		const samplePkgUserMd = `---
name: user-feedback
version: 1.0.0
---
## ⏱ 1. Метрики Виконання
- **Витрачений час розробки (Годин):** \`4.5h\`
- **Кількість ітерацій (Test Runs / Refactors):** \`10\`
- **Фінальний бал RRS (Release Readiness Score):** \`324\`
`
		const sampleAppUserMd = `---
name: user-feedback
version: 0.1.0
---
## ⏱ 1. Метрики Виконання
- **Витрачений час розробки (Годин):** \`2.0h\`
- **Кількість ітерацій (Test Runs / Refactors):** \`5\`
- **Фінальний бал RRS (Release Readiness Score):** \`300\`
`
		const samplePkgReleaseMd = `# v1.0.0 - 2026-09-01
## Tasks
### Done **Feature A** [feat.a]
### InProgress **Feature B** [feat.b]
`
		const db = new DB({
			predefined: [
				['releases.txt', rawReleasesTxt],
				['packages/sample-pkg/package.json', { name: '@nan0web/sample-pkg', version: '1.0.0' }],
				['packages/sample-pkg/releases/1/0/v1.0.0/user.md', samplePkgUserMd],
				['packages/sample-pkg/releases/1/0/v1.0.0/release.md', samplePkgReleaseMd],
				['packages/sample-pkg/releases/1/0/v1.0.0/task.spec.js', '/* spec contract */'],
				['apps/sample-app/package.json', { name: 'sample-app', version: '0.1.0' }],
				['apps/sample-app/releases/0/1/v0.1.0/user.md', sampleAppUserMd],
				['apps/sample-app/releases/0/1/v0.1.0/task.test.js', '/* closed test */'],
			],
		})
		await db.connect()

		const dashboard = new DashboardModel({ registryFile: 'releases.txt' }, { db })
		const data = await dashboard.aggregate()

		assert.equal(data.projects.length, 2)

		// First project check
		const p1 = data.projects.find((p) => p.name === '@nan0web/sample-pkg')
		assert.ok(p1)
		assert.equal(p1.hours, 4.5)
		assert.equal(p1.iterations, 10)
		assert.equal(p1.rrs, 324)
		assert.equal(p1.status, 'wip') // has task.spec.js
		assert.equal(p1.tasks.length, 2)
		assert.equal(p1.tasks[0].slug, 'feat.a')

		// Second project check
		const p2 = data.projects.find((p) => p.name === 'sample-app')
		assert.ok(p2)
		assert.equal(p2.hours, 2.0)
		assert.equal(p2.iterations, 5)
		assert.equal(p2.rrs, 300)
		assert.equal(p2.status, 'closed') // only task.test.js

		// Summary check
		assert.equal(data.summary.totalProjects, 2)
		assert.equal(data.summary.totalHours, 6.5)
		assert.equal(data.summary.totalIterations, 15)
		assert.equal(data.summary.wipCount, 1)
		assert.equal(data.summary.closedCount, 1)
	})

	it('yields progress and show intents when executed via async *run() generator', async () => {
		const rawReleasesTxt = `packages/sample-pkg\n`
		const samplePkgUserMd = `---
name: user-feedback
version: 1.0.0
---
- **Витрачений час розробки (Годин):** \`3.0h\`
- **Кількість ітерацій (Test Runs / Refactors):** \`4\`
- **Фінальний бал RRS (Release Readiness Score):** \`200\`
`
		const db = new DB({
			predefined: [
				['releases.txt', rawReleasesTxt],
				['packages/sample-pkg/package.json', { name: '@nan0web/sample-pkg', version: '1.0.0' }],
				['packages/sample-pkg/releases/1/0/v1.0.0/user.md', samplePkgUserMd],
				['packages/sample-pkg/releases/1/0/v1.0.0/release.md', '# v1.0.0\n### Done Init [init]\n'],
				['packages/sample-pkg/releases/1/0/v1.0.0/task.test.js', '/* closed */'],
			],
		})
		await db.connect()

		const dashboard = new DashboardModel({ registryFile: 'releases.txt' }, { db })
		const intents = []
		const gen = dashboard.run()

		let next = await gen.next()
		while (!next.done) {
			intents.push(next.value)
			next = await gen.next()
		}
		const finalResult = next.value

		assert.ok(intents.length >= 2, 'Expected progress and show intents to be yielded')
		assert.ok(intents.some((i) => i.type === 'progress'))
		assert.ok(intents.some((i) => i.type === 'show'))
		assert.equal(finalResult.type, 'result')
		assert.equal(finalResult.data.projects.length, 1)
		assert.equal(finalResult.data.projects[0].name, '@nan0web/sample-pkg')
	})

	it('supports injected gitTelemetry adapter', async () => {
		const rawReleasesTxt = `packages/no-rel\n`
		const db = new DB({
			predefined: [
				['releases.txt', rawReleasesTxt],
				['packages/no-rel/package.json', { name: '@nan0web/no-rel', version: '0.0.1' }],
			],
		})
		await db.connect()

		const mockGit = {
			getGitInfo: () => ({ branch: 'feature/zen', gitStatus: 'dirty' }),
			getGitCommitTelemetry: () => ({ hours: 0, iterations: 0 }),
		}

		const dashboard = new DashboardModel(
			{ registryFile: 'releases.txt' },
			{ db, gitTelemetry: mockGit }
		)
		const data = await dashboard.aggregate()
		assert.equal(data.projects[0].branch, 'feature/zen')
		assert.equal(data.projects[0].gitStatus, 'dirty')
	})

	it('parses user.md metrics correctly with static parseUserMetrics', () => {
		const text = `
- **Витрачений час розробки (Годин):** \`12.5h\`
- **Кількість ітерацій (Test Runs / Refactors):** \`42\`
- **Фінальний бал RRS (Release Readiness Score):** \`350+\`
`
		const metrics = DashboardModel.parseUserMetrics(text)
		assert.equal(metrics.hours, 12.5)
		assert.equal(metrics.iterations, 42)
		assert.equal(metrics.rrs, 350)
	})
})
