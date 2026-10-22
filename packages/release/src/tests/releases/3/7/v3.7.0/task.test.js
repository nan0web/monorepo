import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { ReleaseAuditor } from '../../../../../domain/inspect/ReleaseAuditor.js'
import { ReleaseConfig } from '../../../../../domain/config/ReleaseConfig.js'
import Scanner from '../../../../../Release/Scanner.js'

/**
 * Helper to drain async generator
 * @param {AsyncGenerator<any, any, any>} gen
 */
async function drain(gen) {
	const intents = []
	let step = await gen.next()
	while (!step.done) {
		intents.push(step.value)
		step = await gen.next()
	}
	return { intents, result: step.value?.data || step.value }
}

describe('Release v3.7.0 Contracts: Layered ReleaseConfig & Backlog Integrity', () => {
	describe('§1 Backlog Integrity: MISPLACED_BACKLOG rule', () => {
		it('allows global backlog.md directly in releases/ root without errors or warnings', async () => {
			const db = new DB({
				predefined: [
					['packages/core/package.json', { name: '@nan0web/core', version: '1.0.0' }],
					['packages/core/releases/backlog.md', '# Global Backlog\n- [ ] Future idea'],
					['packages/core/releases/1/0/v1.0.0/release.md', '# Release\n- [x] Task 1'],
					['packages/core/releases/1/0/v1.0.0/user.md', 'Hours: 1h\nIterations: 1\nRRS: 324'],
					['packages/core/releases/1/0/v1.0.0/task.spec.js', '// spec'],
				],
			})
			await db.connect()

			const auditor = new ReleaseAuditor({ dir: 'packages/core' }, { db })
			await auditor.init()
			const { result } = await drain(auditor.run())

			assert.equal(result.success, true)
			assert.equal(result.errors.length, 0)
			const orphanWarnings = result.warnings.filter((w) => w.code === 'ORPHAN_RELEASE_FILE')
			assert.equal(orphanWarnings.length, 0, 'Global backlog.md must not be flagged as orphan file')
		})

		it('detects misplaced backlog.md inside version directory (warning by default)', async () => {
			const db = new DB({
				predefined: [
					['packages/pkg1/package.json', { name: '@nan0web/pkg1', version: '1.0.0' }],
					['packages/pkg1/releases/1/0/v1.0.0/release.md', '# Release\n- [x] Task 1'],
					['packages/pkg1/releases/1/0/v1.0.0/user.md', 'Hours: 1h\nIterations: 1\nRRS: 324'],
					['packages/pkg1/releases/1/0/v1.0.0/task.spec.js', '// spec'],
					['packages/pkg1/releases/1/0/v1.0.0/backlog.md', '# Local Backlog (Violation)'],
				],
			})
			await db.connect()

			const auditor = new ReleaseAuditor({ dir: 'packages/pkg1' }, { db })
			await auditor.init()
			const { result } = await drain(auditor.run())

			const misplaced = result.warnings.find((w) => w.code === 'MISPLACED_BACKLOG')
			assert.ok(misplaced, 'Should report MISPLACED_BACKLOG warning')
			assert.ok(misplaced.file.includes('backlog.md'))
			assert.ok(misplaced.fix, 'Should provide actionable fix instruction')
		})

		it('elevates MISPLACED_BACKLOG to error if configured in ReleaseConfig rules', async () => {
			const db = new DB({
				predefined: [
					['packages/strict-pkg/package.json', { name: '@nan0web/strict-pkg', version: '1.0.0' }],
					['packages/strict-pkg/release.config.nan0', 'rules:\n  misplaced_backlog: error\n'],
					['packages/strict-pkg/releases/1/0/v1.0.0/release.md', '# Release\n- [x] Task 1'],
					['packages/strict-pkg/releases/1/0/v1.0.0/user.md', 'Hours: 1h\nIterations: 1\nRRS: 324'],
					['packages/strict-pkg/releases/1/0/v1.0.0/task.spec.js', '// spec'],
					['packages/strict-pkg/releases/1/0/v1.0.0/backlog.md', '# Local Backlog (Violation)'],
				],
			})
			await db.connect()

			const config = await ReleaseConfig.load(db, 'packages/strict-pkg')
			const auditor = new ReleaseAuditor({ dir: 'packages/strict-pkg', config }, { db })
			await auditor.init()
			const { result } = await drain(auditor.run())

			assert.equal(result.success, false, 'Audit should fail when misplaced_backlog is configured as error')
			const misplacedError = result.errors.find((e) => e.code === 'MISPLACED_BACKLOG')
			assert.ok(misplacedError, 'Should report MISPLACED_BACKLOG as error')
		})
	})

	describe('§2 Layered ReleaseConfig & Custom releasesDir', () => {
		it('loads cascading config supporting custom releasesDir', async () => {
			const db = new DB({
				predefined: [
					['packages/custom-dir/package.json', { name: '@nan0web/custom', version: '2.0.0' }],
					['packages/custom-dir/release.config.nan0', 'releasesDir: .releases\n'],
					['packages/custom-dir/.releases/2/0/v2.0.0/release.md', '# Release in custom dir\n- [x] Done'],
					['packages/custom-dir/.releases/2/0/v2.0.0/user.md', 'Hours: 2h\nIterations: 3\nRRS: 340'],
					['packages/custom-dir/.releases/2/0/v2.0.0/task.spec.js', '// spec'],
				],
			})
			await db.connect()

			const config = await ReleaseConfig.load(db, 'packages/custom-dir')
			assert.equal(config.releasesDir, '.releases')

			const auditor = new ReleaseAuditor({ dir: 'packages/custom-dir', config }, { db })
			await auditor.init()
			const { result } = await drain(auditor.run())

			assert.equal(result.success, true, 'Audit should pass for custom releasesDir')
			assert.equal(result.checkedReleases.length, 1)
			assert.equal(result.checkedReleases[0].version, '2.0.0')
		})
	})

	describe('§3 Smart Scanner & List Discovery', () => {
		it('discovers releases by version directory even if contract tests are pending', () => {
			const scanner = new Scanner(process.cwd())
 			const status = scanner.status()
			assert.ok(Array.isArray(status), 'Scanner status must return an array')
		})
	})

	describe('§4 CheckCommand Integration & Rules Catalog', () => {
		it('renders rules catalog when --rules is specified', async () => {
			const { CheckCommand } = await import('../../../../../domain/CheckCommand.js')
			const db = new DB()
			await db.connect()

			const cmd = new CheckCommand({ rules: true }, { db })
			const { result, intents } = await drain(cmd.run())

			assert.equal(result.success, true)
			assert.ok(result.rules.MISPLACED_BACKLOG, 'Rules catalog must contain MISPLACED_BACKLOG')
			const foundHeader = intents.some((i) => {
				const text = typeof i === 'string' ? i : i.data || i.text || i.message || ''
				return text.includes('Rules Catalog') || text.includes('MISPLACED_BACKLOG')
			})
			assert.ok(foundHeader, 'Should render catalog header or rules')
		})

		it('supports custom releasesDir in CheckCommand validation', async () => {
			const { CheckCommand } = await import('../../../../../domain/CheckCommand.js')
			const db = new DB({
				predefined: [
					['packages/alt/package.json', { name: '@nan0web/alt', version: '1.0.0' }],
					['packages/alt/.releases/1/0/v1.0.0/release.md', '# Release\n- [x] Task 1'],
					['packages/alt/.releases/1/0/v1.0.0/user.md', 'Hours: 1h\nIterations: 1\nRRS: 324'],
					['packages/alt/.releases/1/0/v1.0.0/task.spec.js', '// spec'],
				],
			})
			await db.connect()

			const cmd = new CheckCommand({ target: 'packages/alt', releasesDir: '.releases' }, { db })
			const { result } = await drain(cmd.run())

			assert.equal(result.success, true, 'CheckCommand should succeed with custom releasesDir')
			assert.equal(result.checkedProjects[0].releases.length, 1)
			assert.equal(result.checkedProjects[0].releases[0], '1.0.0')
		})
	})

	describe('§5 StatusCommand README.md Table Injection (-w)', () => {
		it('injects markdown status table into releases/README.md between markers', async () => {
			const { default: StatusCommand } = await import('../../../../../domain/StatusCommand.js')
			const initialReadme = '# Releases\n\n<!-- releases:status:start -->\n<!-- releases:status:end -->\n'
			const db = new DB({
				predefined: [
					['releases/README.md', initialReadme],
				],
			})
			await db.connect()

			const dummyStatuses = [
				{ version: '3.7.0', state: 'wip', specs: ['task.spec.js'], tests: [] },
				{ version: '3.6.0', state: 'closed', specs: [], tests: ['task.test.js'] },
			]

			const cmd = new StatusCommand({ write: true }, { db })
			await cmd.syncReadmeStatus(db, dummyStatuses)

			const updatedDoc = String(await db.loadDocument('releases/README.md'))
			assert.ok(updatedDoc.includes('<!-- releases:status:start -->'))
			assert.ok(updatedDoc.includes('<!-- releases:status:end -->'))
			assert.ok(updatedDoc.includes('[**v3.7.0**](3/7/v3.7.0/)'))
			assert.ok(updatedDoc.includes('| 🟡 Active (WIP) |'))
			assert.ok(updatedDoc.includes('[**v3.6.0**](3/6/v3.6.0/)'))
			assert.ok(updatedDoc.includes('| 🟢 Closed |'))
		})
	})
})
