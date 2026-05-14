import { describe, it } from 'node:test'
import assert from 'node:assert'
import { createT } from '@nan0web/i18n'
import DB from '@nan0web/db'

import { PhaseAuditor } from './PhaseAuditor.js'

describe('PhaseAuditor (Lifecycle Stages)', () => {
	const t = createT({}, 'en')

	describe('Phase Lifecycle Detection', () => {
		const dataset = [
			{
				name: 'Stage 1: Root seed.md',
				data: [['seed.md', 'Seed']],
				expected: 'seed',
			},
			{
				name: 'Stage 1: Localized docs/uk/seed.md (Valid)',
				data: [
					['docs/_/langs.nan0', [{ locale: 'uk' }]],
					['docs/uk/seed.md', 'Seed']
				],
				expected: 'seed',
			},
			{
				name: 'Stage 1: Localized docs/uk/seed.md (Invalid - missing lang)',
				data: [
					['docs/_/langs.nan0', [{ locale: 'en' }]],
					['docs/uk/seed.md', 'Seed']
				],
				expected: 'unknown',
			},
			{
				name: 'Stage 2: Seed + Project (Root)',
				data: [
					['seed.md', 'Seed'],
					['project.md', 'Project'],
				],
				expected: 'transform',
			},
			{
				name: 'Stage 2: Localized Seed + Project (Valid)',
				data: [
					['docs/_/langs.nan0', [{ locale: 'uk' }]],
					['docs/uk/seed.md', 'Seed'],
					['docs/uk/project.md', 'Project'],
				],
				expected: 'transform',
			},
			{
				name: 'Stage 3: Project only (Root)',
				data: [['project.md', 'Project']],
				expected: 'stable',
			},
			{
				name: 'Stage 4: Production (Finished Release)',
				data: [
					['project.md', 'Project'],
					['releases/', {}],
					['releases/v1.0.0/', {}],
					['releases/v1.0.0/task.md', '- [x] Task 1\n- [x] Task 2'],
				],
				expected: 'production',
			},
			{
				name: 'Stage 4: Multiple Finished Releases',
				data: [
					['project.md', 'Project'],
					['releases/', {}],
					['releases/v1.0.0/', {}],
					['releases/v1.0.0/task.md', '- [x] Task 1'],
					['releases/v1.1.0/', {}],
					['releases/v1.1.0/task.md', '- [x] Task 2'],
				],
				expected: 'production',
				verify: (res) => {
					assert.strictEqual(res.progress.name, 'v1.1.0')
					assert.strictEqual(res.progress.percentage, 100)
				}
			},
			{
				name: 'Stage: Development (Multiple Releases, 50% Progress)',
				data: [
					['project.md', 'Project'],
					['releases/', {}],
					['releases/v1.0.0/', {}],
					['releases/v1.0.0/task.md', '- [x] Old task'],
					['releases/v1.1.0/', {}],
					['releases/v1.1.0/task.md', '- [x] Done\n- [ ] Pending'],
				],
				expected: 'development',
				verify: (res) => {
					assert.strictEqual(res.progress.name, 'v1.1.0')
					assert.strictEqual(res.progress.percentage, 50)
				}
			},
		]

		for (const { name, data, expected, verify } of dataset) {
			it(name, async () => {
				const db = new DB({ predefined: data })
				await db.connect()

				const res = await PhaseAuditor.execute({ dir: '.' }, { db, t })
				assert.strictEqual(res.phase, expected)
				if (verify) verify(res)
			})
		}
	})
})
