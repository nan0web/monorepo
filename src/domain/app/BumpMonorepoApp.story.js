import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { runGenerator } from '@nan0web/ui'
import { createT } from '@nan0web/types'
import DB from '@nan0web/db'
import BumpMonorepoApp from './BumpMonorepoApp.js'

describe('BumpMonorepoApp OLMUI Scenario', () => {
	it('bumps versions for all packages and ignores if version already matches', async () => {
		const db = new DB({
			predefined: [
				['package.json', { name: 'root', version: '2.0.0' }],
				['packages/core/package.json', { name: '@nan0web/types', version: '2.0.0' }],
				['packages/ui/package.json', { name: '@nan0web/ui', version: '3.0.0' }],
				['apps/nan0web.app/package.json', { name: 'nan0web.app', version: '2.0.0' }],
			],
		})
		await db.connect()
		db.mount('@app', db)

		const t = createT({}, 'en')
		const model = new BumpMonorepoApp({ version: '3.0.0' }, { db, t, locale: 'en' })

		const events = []
		const data = await runGenerator(model.run(), {
			ask: async () => ({ value: {} }),
			show: (i) => events.push(`show:${i.message || i.content}`),
			progress: (i) => events.push(`progress:${i.message || i.content || i.title}`),
		})

		assert.ok(data, 'App should complete successfully')

		// Verify output events
		assert.ok(events.includes('show:New version 3.0.0 in /'), 'Should show initial message')

		// @nan0web/ui is already 3.0.0, so it should not bump
		assert.ok(
			events.includes('show:@nan0web/ui is already at 3.0.0'),
			'Should skip already bumped package',
		)

		// The others should be bumped
		assert.ok(events.includes('show:root@2.0.0 -> 3.0.0'), 'Should bump root')
		assert.ok(events.includes('show:@nan0web/types@2.0.0 -> 3.0.0'), 'Should bump core')
		assert.ok(events.includes('show:nan0web.app@2.0.0 -> 3.0.0'), 'Should bump app')

		// Verify DB state
		const rootPkg = await db.loadDocument('@app/package.json')
		assert.equal(rootPkg.version, '3.0.0', 'Root should be bumped in DB')

		const uiPkg = await db.loadDocument('@app/packages/ui/package.json')
		assert.equal(uiPkg.version, '3.0.0', 'UI should remain 3.0.0 in DB')
	})

	it('respects dryRun flag and does not modify the database', async () => {
		const db = new DB({
			predefined: [['package.json', { name: 'root', version: '2.0.0' }]],
		})
		await db.connect()
		db.mount('@app', db)

		const t = createT({}, 'en')
		const model = new BumpMonorepoApp({ version: '3.0.0', dryRun: true }, { db, t, locale: 'en' })

		const events = []
		await runGenerator(model.run(), {
			ask: async () => ({ value: {} }),
			show: (i) => events.push(`show:${i.message || i.content}`),
			progress: (i) => events.push(`progress:${i.message || i.content || i.title}`),
		})

		assert.ok(
			events.includes('show:[DRY RUN] Would bump root@2.0.0 -> 3.0.0'),
			'Should show dry run message',
		)

		// Verify DB state - should NOT be bumped
		const rootPkg = await db.loadDocument('@app/package.json')
		assert.equal(rootPkg.version, '2.0.0', 'Root should NOT be bumped in DB during dry run')
	})
})
