import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { DashboardModel } from '@nan0web/release'

describe('OLMUI Contract & Lit Web Components (v0.2.0)', () => {
	it('DashboardModel standardizes numeric priorities (0..3) and supports tasks sorting', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'packages/sample\n'],
				['packages/sample/package.json', { name: '@nan0web/sample', version: '1.0.0' }],
				[
					'packages/sample/releases/1/0/v1.0.0/release.md',
					`---
priority: P0
---
# v1.0.0
- [x] Urgent bugfix P0
- [ ] Feature B P2
- [ ] Regular task
`,
				],
				['packages/sample/releases/1/0/v1.0.0/user.md', 'Hours: 2h\nIterations: 4\nRRS: 335'],
				['packages/sample/releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		const model = new DashboardModel({ registryFile: 'releases.txt' }, { db })
		const data = await model.aggregate()

		assert.equal(data.projects.length, 1)
		const proj = data.projects[0]
		assert.equal(proj.priority, '0') // Standardized numeric priority 0..3

		// Check parsed tasks priorities
		assert.equal(proj.tasks.length, 3)
		assert.equal(proj.tasks[0].priority, '0')
		assert.equal(proj.tasks[1].priority, '2')
		assert.equal(proj.tasks[2].priority, '1') // default medium/normal is 1

		// Test sorting by priority
		const sorted = DashboardModel.sortTasks(proj.tasks, 'priority')
		assert.equal(sorted[0].slug, 'urgent-bugfix-p0')
		assert.equal(sorted[1].slug, 'regular-task')
		assert.equal(sorted[2].slug, 'feature-b-p2')
	})

	it('CLI Table & Inspector components render formatted output cleanly', async () => {
		const { renderProjectTable, renderProjectInspector } = await import(
			'../../../../src/ui/cli/index.js'
		)
		assert.equal(typeof renderProjectTable, 'function')
		assert.equal(typeof renderProjectInspector, 'function')

		const sampleProject = {
			name: '@nan0web/sample',
			version: '1.0.0',
			branch: 'main',
			gitStatus: 'clean',
			status: 'wip',
			hours: 2,
			iterations: 4,
			rrs: 335,
			priority: '0',
			tasks: [{ content: 'Urgent task', status: 'Done', priority: '0' }],
		}

		const tableLines = renderProjectTable({
			projects: [sampleProject],
			summary: { totalProjects: 1, wipCount: 1, closedCount: 0, totalHours: 2, totalIterations: 4 },
		})
		assert.ok(Array.isArray(tableLines))
		assert.ok(tableLines.some((l) => l.includes('@nan0web/sample')))
		assert.ok(tableLines.some((l) => l.includes('[WIP]')))

		const inspectorLines = renderProjectInspector(sampleProject, 0)
		assert.ok(Array.isArray(inspectorLines))
		assert.ok(inspectorLines.some((l) => l.includes('Project Inspector: #1 @nan0web/sample@1.0.0')))
		assert.ok(inspectorLines.some((l) => l.includes('Urgent task')))
	})

	it('Lit Web Components export and schema validation', async () => {
		const {
			ReleaseProjectCard,
			ReleaseTaskList,
			ReleaseFilterBar,
			ReleaseDashboardLit,
		} = await import('../../../../src/ui/lit/index.js')

		assert.ok(ReleaseProjectCard)
		assert.ok(ReleaseTaskList)
		assert.ok(ReleaseFilterBar)
		assert.ok(ReleaseDashboardLit)

		assert.equal(typeof ReleaseProjectCard.properties, 'object')
		assert.equal(typeof ReleaseTaskList.properties, 'object')
		assert.equal(typeof ReleaseFilterBar.properties, 'object')
		assert.equal(typeof ReleaseDashboardLit.properties, 'object')
	})
})
