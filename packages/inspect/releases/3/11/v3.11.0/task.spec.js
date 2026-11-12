import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DB } from '@nan0web/db'
import { ArchitectureAuditor } from '../../../../src/domain/app/ArchitectureAuditor.js'
import { CircularDependencyAuditor } from '../../../../src/domain/app/CircularDependencyAuditor.js'
import { StructureAuditor } from '../../../../src/domain/app/StructureAuditor.js'
import { BuildWorkflowsApp } from '../../../../src/domain/app/BuildWorkflowsApp.js'
import { InspectConfig } from '../../../../src/domain/config/InspectConfig.js'
import { AuditorModel } from '../../../../src/domain/AuditorModel.js'

describe('v3.11.0: Self-Inspection Technical Hygiene & Zero-Smell Refactoring', () => {
	describe('§1 Model-as-Schema & Schema Fields Contract', () => {
		it('AuditorModel declares timeout with JSDoc @type in constructor', () => {
			const model = new AuditorModel({ timeout: 45 })
			assert.equal(model.timeout, 45)
		})

		it('InspectConfig declares snapshots and rules in constructor without missing field warnings', () => {
			const config = new InspectConfig({
				snapshots: { optional: true },
				rules: { testRule: true },
			})
			assert.equal(config.snapshots.optional, true)
			assert.equal(config.rules.testRule, true)
		})

		it('ArchitectureAuditor avoids redundant manual assignment of skip', () => {
			const auditor = new ArchitectureAuditor({ skip: 'circular' })
			assert.equal(auditor.skip, 'circular')
		})
	})

	describe('§2 Domain DB Isolation (Zero raw fs/path in domain apps)', () => {
		it('StructureAuditor uses fileExists/dirExists on DB rather than node:fs', async () => {
			const db = new DB({
				predefined: [
					['system.md', '# System'],
					['playground/index.html', '<html/>'],
				],
			})
			await db.connect()

			const auditor = new StructureAuditor({ dir: '.' }, { db, t: (k) => k })
			const gen = auditor.run()
			let last = null
			while (true) {
				const step = await gen.next()
				if (step.done) {
					last = step.value
					break
				}
			}

			const data = last?.data || last
			assert.equal(data.ok, true)
			assert.equal(data.errors.length, 0)
		})

		it('BuildWorkflowsApp uses DB for file operations and manifest compilation', async () => {
			const db = new DB({
				predefined: [
					[
						'nan0web.nan0',
						`name: "test-workspace"
agents:
  - id: "agent-1"
    workflows:
      - "docs/uk/workflows/test.md"
`,
					],
					[
						'docs/uk/workflows/test.md',
						`---
id: "test-wf"
name: "Test"
lang: "uk"
---
# Content`,
					],
				],
			})
			await db.connect()

			const app = new BuildWorkflowsApp({ dir: '.' }, { db, t: (k) => k })
			const gen = app.run()
			let last = null
			while (true) {
				const step = await gen.next()
				if (step.done) {
					last = step.value
					break
				}
			}

			const data = last?.data || last
			assert.equal(data.ok, true)
			assert.equal(data.ukCount, 1)
		})
	})
})
