import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import CheckCommand from './CheckCommand.js'

describe('CheckCommand OLMUI Scenario & Validator', () => {
	it('validates a compliant project release structure without errors', async () => {
		const pkgJson = { name: '@nan0web/sample-pkg', version: '1.0.0' }
		const releaseMd = `# v1.0.0 - 2026-09-01
## Tasks
- [x] Implement initial feature
`
		const userMd = `---
name: user-feedback
version: 1.0.0
---
## ⏱ 1. Метрики Виконання
- **Витрачений час розробки (Годин):** \`4.5h\`
- **Кількість ітерацій (Test Runs / Refactors):** \`10\`
- **Фінальний бал RRS (Release Readiness Score):** \`324\`
`
		const taskSpec = `import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
describe('sample contract', () => {
	it('works', () => assert.ok(true))
})
`
		const db = new DB({
			predefined: [
				['packages/sample-pkg/package.json', pkgJson],
				['packages/sample-pkg/releases/1/0/v1.0.0/release.md', releaseMd],
				['packages/sample-pkg/releases/1/0/v1.0.0/user.md', userMd],
				['packages/sample-pkg/releases/1/0/v1.0.0/task.spec.js', taskSpec],
			],
		})
		await db.connect()

		const cmd = new CheckCommand({ target: 'packages/sample-pkg' }, { db })
		const gen = cmd.run()

		let step = await gen.next()
		const outputs = []
		while (!step.done) {
			outputs.push(step.value)
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.ok(res.success)
		assert.equal(res.diagnostics.length, 0)
		assert.equal(res.checkedProjects.length, 1)
	})

	it('detects missing user.md metrics and missing contracts with actionable recommendations', async () => {
		const pkgJson = { name: '@nan0web/broken-pkg', version: '2.0.0' }
		const releaseMd = `# v2.0.0 - 2026-09-01
## Tasks
- [ ] Incomplete task
`
		const db = new DB({
			predefined: [
				['packages/broken-pkg/package.json', pkgJson],
				['packages/broken-pkg/releases/2/0/v2.0.0/release.md', releaseMd],
			],
		})
		await db.connect()

		const cmd = new CheckCommand({ target: 'packages/broken-pkg' }, { db })
		const gen = cmd.run()

		let step = await gen.next()
		const outputs = []
		while (!step.done) {
			outputs.push(step.value)
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.equal(res.success, false)
		assert.ok(res.diagnostics.length >= 2)

		// Check for missing user.md diagnostic
		const userDiag = res.diagnostics.find((d) => d.code === 'MISSING_USER_MD' || d.type === 'missing_user_md')
		assert.ok(userDiag)
		assert.ok(userDiag.fix.includes('user.md'))

		// Check for missing contract diagnostic
		const contractDiag = res.diagnostics.find((d) => d.code === 'MISSING_CONTRACT' || d.type === 'missing_contract')
		assert.ok(contractDiag)
		assert.ok(contractDiag.fix.includes('task.spec.js'))
	})
})
