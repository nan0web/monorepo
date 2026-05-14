import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { ArchitectureAuditor } from '../../../../../domain/app/ArchitectureAuditor.js'
import { PhaseAuditor } from '../../../../../domain/app/PhaseAuditor.js'
import { DB } from '@nan0web/db'

async function drainGenerator(gen) {
	const intents = []
	let last = null
	try {
		while (true) {
			const step = await gen.next()
			if (step.done) { last = step.value; break }
			intents.push(step.value)
		}
	} catch (e) {
		console.error('Generator error:', e)
		throw e
	}
	return { intents, result: last }
}

describe('v1.0.0 Release Task Suite — Hermetic Isolation', () => {
	let db

	beforeEach(async () => {
		db = new DB({ predefined: [
			['package.json', { 
				name: '@nan0web/inspect', 
				version: '1.0.0',
				private: true, 
				scripts: { 
					test: 'node --test',
					'test:all': 'npm run build && npm run test && npm run knip',
					build: 'tsc',
					prebuild: 'rm -rf dist types',
					knip: 'knip',
					play: 'node play/main.js',
					'test:docs': 'node --test README.md.js',
					'test:release': 'npm run test:all',
					'release:spec': 'node bin/release.js',
					'test:coverage': 'c8 node --test'
				},
				devDependencies: {
					typescript: 'latest',
					knip: 'latest',
					c8: 'latest'
				} 
			}],
			['seed.md', '# Seed'],
			['project.md', '# Project'],
			['CONTRIBUTING.md', ''],
			['LICENSE', ''],
			['.editorconfig', ''],
			['tsconfig.json', {}],
			['knip.json', {}],
			['src/index.js', 'export const x = 1'],
			['src/domain/index.js', 'export const y = 2'],
			['play/main.js', ''],
			['README.md.js', ''],
			['snapshots/core/', {}]
		] })
		await db.connect()
	})

	describe('§1 PhaseAuditor', () => {
		it('PhaseAuditor should be exported from index', async () => {
			const mod = await import('../../../../../index.js')
			assert.ok(mod.PhaseAuditor)
		})

		it('PhaseAuditor.run() detects "transform" phase', async () => {
			const auditor = new PhaseAuditor({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())
			assert.equal(result.data.phase, 'transform')
		})
	})

	describe('§2 HygieneAuditor', () => {
		it('HygieneAuditor verifies scripts in mock env', async () => {
			const AuditorCls = await ArchitectureAuditor.getAuditorClass('hygiene', 'js')
			const auditor = new AuditorCls({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())
			assert.equal(result.data.success, true)
		})
	})

	describe('§3 ExportAuditor', () => {
		it('ExportAuditor verifies exports in mock env', async () => {
			const AuditorCls = await ArchitectureAuditor.getAuditorClass('export', 'js')
			const auditor = new AuditorCls({ dir: '.' }, { db, t: (k) => k })
			const { result } = await drainGenerator(auditor.run())
			assert.equal(result.data.success, true)
		})
	})

	describe('§6 ArchitectureAuditor Integration', () => {
		it('ArchitectureAuditor.run() yields intents and full score', async () => {
			const auditor = new ArchitectureAuditor({ dir: '.' }, { db, t: (k) => k })
			const { intents, result } = await drainGenerator(auditor.run())

			assert.ok(intents.length > 0, 'Should have intents')
			assert.ok(intents.find(i => i.type === 'progress'), 'Should have progress intent')
			assert.ok(result.data.score > 0, 'Should have a score')
			assert.ok(result.data.phase, 'Should have phase')
			assert.ok(result.data.hygiene, 'Should have hygiene')
			assert.ok(result.data.exports, 'Should have exports')
			assert.ok(result.data.domain, 'Should have domain')
			assert.ok(result.data.verification, 'Should have verification')
			assert.ok(result.data.circular, 'Should have circular results')
		})
	})
})
