import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ArchitectureAuditor } from './ArchitectureAuditor.js'
import { DB } from '@nan0web/db'

describe('ArchitectureAuditor', () => {
	it('should run the full pipeline and return a structured score result', { timeout: 15000 }, async () => {
		// Minimal mock dir using predefined DB
		const db = new DB({ predefined: [
			['package.json', { name: 'test', private: true }],
			['seed.md', '# Seed'],
		] })
		await db.connect()

		const auditor = new ArchitectureAuditor({ dir: '.' }, { db })
		const steps = []
		const gen = auditor.run()
		let res = await gen.next()
		while (!res.done) {
			steps.push(res.value)
			res = await gen.next()
		}

		// Contract: must yield progress intents during execution
		assert.ok(steps.length > 0, 'Should have yielded intents')
		assert.ok(steps.some((s) => s.type === 'progress'), 'Should have progress updates')

		// Contract: result must carry score structure
		const data = res.value?.data
		assert.ok(data, 'Must return result data')
		assert.ok('success' in data, 'data.success must exist')
		assert.ok('metrics' in data, 'data.metrics must exist')
		assert.ok('passed' in data.metrics, 'data.metrics.passed must exist')
		assert.ok('total' in data.metrics, 'data.metrics.total must exist')
		assert.ok('pct' in data.metrics, 'data.metrics.pct (percentage) must exist')
		assert.ok(Array.isArray(data.errors), 'data.errors must be an array')

		// Progress values must be normalized (0..1) or undefined
		const progressSteps = steps.filter((s) => s.type === 'progress')
		assert.ok(
			progressSteps.every((s) => s.value === undefined || (s.value >= 0 && s.value <= 1)),
			'Progress must be 0..1 or undefined',
		)
	})
})
