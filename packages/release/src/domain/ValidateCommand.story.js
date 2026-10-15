import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { ValidateCommand } from './ValidateCommand.js'

describe('Scenario: ValidateCommand Multi-Format Inspection with In-Memory DB', () => {
	it('executes full scan and renders formatted report', async () => {
		const releaseMd = `---
status: work
type: minor
epic: EPIC-CORE
sprint: Sprint 1
tracker: https://github.com/nan0web/nan.web/issues/{id}
---

# v1.0.0 — Core Release Inspector

## Опис та Мета
Створення CLI інструменту інспекції релізів.

## Команда
- **Lead / Architect:** Олександр Снігірьов (@snigirev)
- **AI Lead Developer:** Agent Antigravity (@agy)

## Робочий План та Задачі
- [x] [#101] Core inspection logic
- [ ] [#102] Multi-format reporter

## Паритет Даних
| Колекція | Очікувано | Фактично | Статус | Коментар |
| :--- | :---: | :---: | :---: | :--- |
| releases | 1 | 1 | ✅ OK | Synced |
`
		const userMd = `---
hours: 1.5
iterations: 4
rrs: 330
---
# Metrics
Hours: 1.5h
Iterations: 4
RRS: 330
`

		const db = new DB({
			predefined: [
				['package.json', { name: '@nan0web/sample', version: '1.0.0' }],
				['releases/1/0/v1.0.0/release.md', releaseMd],
				['releases/1/0/v1.0.0/user.md', userMd],
				['releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		// 1. Text format
		const cmdText = new ValidateCommand({ target: '.' }, { db })
		const genText = cmdText.run()
		let step = await genText.next()
		while (!step.done) {
			step = await genText.next()
		}
		const resText = step.value?.data || step.value
		assert.ok(resText.success)
		assert.equal(resText.releases.length, 1)
		assert.match(resText.output, /Release \[v1\.0\.0\] ✅ VALID/)
		assert.match(resText.output, /Core inspection logic/)

		// 2. JSON format
		const cmdJson = new ValidateCommand({ target: '.', format: 'json' }, { db })
		const genJson = cmdJson.run()
		step = await genJson.next()
		while (!step.done) {
			step = await genJson.next()
		}
		const resJson = step.value?.data || step.value
		assert.ok(resJson.success)
		const parsed = JSON.parse(resJson.output)
		assert.equal(parsed.releases[0].tasks.length, 2)
		assert.equal(parsed.releases[0].parity.length, 1)

		// 3. CSV format with file export
		const cmdCsv = new ValidateCommand({ target: '.', format: 'csv', output: 'export.csv' }, { db })
		const genCsv = cmdCsv.run()
		step = await genCsv.next()
		while (!step.done) {
			step = await genCsv.next()
		}
		const savedCsv = await db.loadDocument('export.csv', null)
		assert.ok(savedCsv)
		assert.match(savedCsv, /v1\.0\.0,101,Core inspection logic,done/)
	})
})
