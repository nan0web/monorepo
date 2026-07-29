import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import { createT } from '@nan0web/types'
import DB from '@nan0web/db'
import AuditMonorepoApp from './AuditMonorepoApp.js'

// Subclass to mock runArchAudit to avoid running real inspect module
class MockAuditMonorepoApp extends AuditMonorepoApp {
	async runArchAudit(pkgPath) {
		if (pkgPath.includes('core')) return { ratio: 0.95 }
		if (pkgPath.includes('ui')) return { ratio: 0.75 }
		if (pkgPath.includes('app')) return { ratio: 0.45 }
		return null
	}
}

describe('AuditMonorepoApp OLMUI Scenario', () => {
	it('fails if db is missing', async () => {
		const t = createT({}, 'en')
		const model = new AuditMonorepoApp({}, { t, locale: 'en' })
		const events = []
		const data = await runGenerator(model.run(), {
			ask: async () => ({ value: {} }),
			show: (i) => events.push(`show:${i.message || i.content}`),
		})
		assert.equal(data.ok, false)
		assert.ok(events.includes('show:Database is required to run audit'))
	})

	it('successfully audits packages and generates STATUS.md', async () => {
		const db = new DB({
			predefined: [
				['pnpm-workspace.yaml', { packages: ['packages/*', 'apps/*'] }],
				['packages/core/package.json', { name: '@nan0web/core', version: '3.1.0', license: 'ISC' }],
				['packages/core/project.md', '# Core package\nGoal of the core package.\n- [x] Task 1\n- [ ] Task 2'],
				['packages/core/docs/index', { langs: [{ locale: 'uk' }] }],
				['packages/core/uk/project.md', '# Core package UK\nGoal of the core UK.\n- [x] Task 1'],
				['packages/ui/package.json', { name: '@nan0web/ui', version: '3.0.0', license: 'MIT' }],
				['packages/ui/project.md', '# UI package\nGoal of the UI package.\n- [ ] Task 1'],
				['apps/dashboard/package.json', { name: 'dashboard', version: '2.0.0', license: 'Apache-2.0' }],
				['apps/dashboard/next.md', '# Dashboard App\nGoal of the Dashboard App.\n- [x] Task 1\n- [x] Task 2'],
			]
		})
		await db.connect()
		db.mount('@app', db)

		const t = createT({}, 'en')
		const model = new MockAuditMonorepoApp({}, { db, t, locale: 'en' })

		const events = []
		const data = await runGenerator(model.run(), {
			ask: async () => ({ value: {} }),
			show: (i) => events.push(`show:${i.message || i.content}`),
			progress: (i) => events.push(`progress:${i.message || i.content || i.title}`),
		})

		assert.ok(data.scanned, 'Should return scanned modules')
		assert.equal(data.scanned.length, 3)

		// Verify STATUS.md was generated
		const statusMd = await db.loadDocument('@app/STATUS.md')
		assert.ok(statusMd, 'STATUS.md should exist')
		assert.ok(statusMd.includes('# Ecosystem Audit 3.0'))
		assert.ok(statusMd.includes('📦 **core**'))
		assert.ok(statusMd.includes('📱 **dashboard**'))

		// Verify task calculations: core has 1/2 from project.md + 1/1 from uk/project.md = 2/3 total
		const coreModule = data.scanned.find(m => m.name === 'core')
		assert.ok(coreModule)
		assert.equal(coreModule.files['project.md'].total, 2)
		assert.equal(coreModule.files['project.md'].completed, 1)
		assert.equal(coreModule.files['uk/project.md'].total, 1)
		assert.equal(coreModule.files['uk/project.md'].completed, 1)

		// Verify goals are extracted
		assert.equal(coreModule.goal, 'Goal of the core UK.')
	})
})
