import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { InspectorApp } from '../../../../src/domain/app/InspectorApp.js'
import { ReleaseAuditor } from '../../../../src/domain/app/ReleaseAuditor.js'

describe('Release v3.10.0: nan0inspect release subcommand', () => {
	it('InspectorApp registers ReleaseAuditor in command options', () => {
		const hasRelease = InspectorApp.command.options.some((opt) => opt === ReleaseAuditor)
		assert.ok(hasRelease, 'InspectorApp.command.options must include ReleaseAuditor')
		assert.equal(ReleaseAuditor.alias, 'release')
	})

	it('returns ok when status: in_progress has task.spec.js and user.md', async () => {
		const db = new DB()
		await db.saveDocument('releases/1/0/v1.0.0/task.md', 'status: in_progress\n# Task')
		await db.saveDocument('releases/1/0/v1.0.0/task.spec.js', '// spec')
		await db.saveDocument('releases/1/0/v1.0.0/user.md', '# User')

		const auditor = new ReleaseAuditor({ dir: '.' }, { db })
		const outputs = []
		let finalResult = null
		for await (const item of auditor.run()) {
			outputs.push(item)
			if (item?.type === 'result') {
				finalResult = item
			}
		}

		assert.ok(finalResult, 'Expected a result intent')
		assert.equal(finalResult.data.errors.length, 0)
		assert.ok(
			outputs.some((o) => String(o?.message || o?.data?.message || '').includes('release:validate ok')),
			'Expected release:validate ok message'
		)
	})

	it('returns error when task.spec.js or user.md is missing for status: in_progress', async () => {
		const db = new DB()
		await db.saveDocument('releases/1/0/v1.0.0/task.md', 'status: in_progress\n# Task')
		await db.saveDocument('releases/1/0/v1.0.0/user.md', '# User')
		// task.spec.js is missing

		const auditor = new ReleaseAuditor({ dir: '.' }, { db })
		let finalResult = null
		for await (const item of auditor.run()) {
			if (item?.type === 'result') {
				finalResult = item
			}
		}

		assert.ok(finalResult, 'Expected a result intent')
		assert.ok(finalResult.data.errors.length > 0, 'Expected validation errors')
		assert.ok(
			finalResult.data.errors.some((e) => String(e.error || e.message || '').includes('task.spec.js')),
			'Expected error mentioning missing task.spec.js'
		)
	})

	it('clearly reports which versions and files are missing across multiple releases and versions', async () => {
		const db = new DB()
		// Valid v1.0.0
		await db.saveDocument('releases/1/0/v1.0.0/task.md', 'status: in_progress\n# Task 1.0.0')
		await db.saveDocument('releases/1/0/v1.0.0/task.spec.js', '// spec')
		await db.saveDocument('releases/1/0/v1.0.0/user.md', '# User')

		// Invalid v1.1.0 (missing task.spec.js)
		await db.saveDocument('releases/1/1/v1.1.0/task.md', 'status: in_progress\n# Task 1.1.0')
		await db.saveDocument('releases/1/1/v1.1.0/user.md', '# User')

		// Invalid v2.0.0 (missing user.md and task.spec.js)
		await db.saveDocument('releases/2/0/v2.0.0/task.md', 'status: in_progress\n# Task 2.0.0')

		// Valid v2.1.0 (done, ignored if not in_progress)
		await db.saveDocument('releases/2/1/v2.1.0/task.md', 'status: done\n# Task 2.1.0')

		const auditor = new ReleaseAuditor({ dir: '.' }, { db })
		const outputs = []
		let finalResult = null
		for await (const item of auditor.run()) {
			outputs.push(item)
			if (item?.type === 'result') {
				finalResult = item
			}
		}

		assert.ok(finalResult, 'Expected a result intent')
		assert.equal(finalResult.data.ok, false)
		assert.equal(finalResult.data.errors.length, 3, 'Expected 3 missing file errors total')

		const errorMessages = finalResult.data.errors.map((e) => e.error)
		assert.ok(
			errorMessages.some((m) => m.includes('releases/1/1/v1.1.0/task.spec.js')),
			'Expected error for missing v1.1.0/task.spec.js'
		)
		assert.ok(
			errorMessages.some((m) => m.includes('releases/2/0/v2.0.0/task.spec.js')),
			'Expected error for missing v2.0.0/task.spec.js'
		)
		assert.ok(
			errorMessages.some((m) => m.includes('releases/2/0/v2.0.0/user.md')),
			'Expected error for missing v2.0.0/user.md'
		)
		assert.ok(
			!errorMessages.some((m) => m.includes('v1.0.0') || m.includes('v2.1.0')),
			'Valid or done releases should not be reported as errors'
		)
	})

	it('generates markdown report automatically when report option is provided', async () => {
		const db = new DB()
		await db.saveDocument('releases/1/1/v1.1.0/task.md', 'status: in_progress\n# Task 1.1.0')
		await db.saveDocument('releases/1/1/v1.1.0/user.md', '# User')

		const auditor = new ReleaseAuditor({ dir: '.', report: 'releases-report.md' }, { db })
		for await (const _ of auditor.run()) {
			// consume
		}

		const reportContent = await db.loadDocument('releases-report.md')
		assert.equal(typeof reportContent, 'string')
		assert.ok(reportContent.includes('# Release Validation Report'))
		assert.ok(reportContent.includes('releases/1/1/v1.1.0/task.spec.js'))
	})

	it('scans recursively with -r/--recursive, ignores node_modules/.git/.venv, and writes -o/--out report', async () => {
		const db = new DB()
		await db.saveDocument('packages/a/releases/1/0/v1.0.0/task.md', 'status: in_progress\n# A')
		await db.saveDocument('packages/a/releases/1/0/v1.0.0/task.spec.js', '// spec')
		await db.saveDocument('packages/a/releases/1/0/v1.0.0/user.md', '# User')

		await db.saveDocument('packages/b/releases/1/0/v1.0.0/task.md', 'status: in_progress\n# B')
		// missing task.spec.js and user.md in packages/b

		// Should be ignored
		await db.saveDocument('packages/a/node_modules/pkg/releases/1/0/v1.0.0/task.md', 'status: in_progress')
		await db.saveDocument('.git/releases/1/0/v1.0.0/task.md', 'status: in_progress')
		await db.saveDocument('.venv/releases/1/0/v1.0.0/task.md', 'status: in_progress')

		const auditor = new ReleaseAuditor({ dir: '.', recursive: true, out: 'out-report.md' }, { db })
		const outputs = []
		for await (const item of auditor.run()) {
			outputs.push(item)
		}

		assert.ok(
			outputs.some((o) => String(o?.message || o?.data?.message || '').includes('Report saved to out-report.md')),
			'Expected short summary message when out is provided'
		)

		const report = await db.loadDocument('out-report.md')
		assert.ok(report.includes('## Summary by Package'))
		assert.ok(report.includes('packages/a'))
		assert.ok(report.includes('packages/b/releases/1/0/v1.0.0/task.spec.js'))
		assert.ok(!report.includes('node_modules'))
		assert.ok(!report.includes('.git'))
		assert.ok(!report.includes('.venv'))
	})
})
