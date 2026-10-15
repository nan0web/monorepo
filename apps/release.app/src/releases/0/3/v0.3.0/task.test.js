import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { ModelAsApp } from '@nan0web/ui'
import { ValidateCommand } from '@nan0web/release/domain/ValidateCommand'
import { ReleaseApp as AppReleaseApp } from '../../../../domain/app/ReleaseApp.js'
import { ReleaseApp as CoreReleaseApp } from '@nan0web/release/domain/App'

describe('Release v0.3.0 Contract: ValidateCommand & Multi-Format Inspector', () => {
	it('ValidateCommand should inherit from ModelAsApp and define required schema options', async () => {
		assert.ok(ValidateCommand)
		assert.ok(Object.prototype.isPrototypeOf.call(ModelAsApp, ValidateCommand))

		assert.equal(ValidateCommand.alias, 'validate')
		assert.ok(ValidateCommand.target)
		assert.equal(ValidateCommand.target.positional, true)

		assert.ok(ValidateCommand.format)
		assert.equal(ValidateCommand.format.default, 'text')
		assert.deepEqual(ValidateCommand.format.options, ['text', 'json', 'nan0', 'csv'])

		assert.ok(ValidateCommand.output)
	})

	it('ValidateCommand should discover both nested (PMaC) and flat release directories', async () => {
		const sampleMd = `---
status: work
type: minor
---
# v1.0.0 — Sample
## Робочий План та Задачі
- [x] Task 1
- [ ] Task 2
`
		const sampleUser = `Hours: 2.0h\nIterations: 3\nRRS: 330`

		const db = new DB({
			predefined: [
				['apps/demo/package.json', { name: 'demo', version: '1.0.0' }],
				// Nested PMaC
				['apps/demo/releases/1/0/v1.0.0/release.md', sampleMd],
				['apps/demo/releases/1/0/v1.0.0/user.md', sampleUser],
				['apps/demo/releases/1/0/v1.0.0/task.spec.js', '// spec'],
				// Flat
				['apps/flat/package.json', { name: 'flat', version: '2.0.0' }],
				['apps/flat/releases/v2.0.0/task.md', sampleMd.replace('v1.0.0', 'v2.0.0')],
				['apps/flat/releases/v2.0.0/user.md', sampleUser],
				['apps/flat/releases/v2.0.0/task.test.js', '// test'],
			],
		})
		await db.connect()

		// Test nested
		const cmdNested = new ValidateCommand({ target: 'apps/demo' }, { db })
		const genNested = cmdNested.run()
		let step = await genNested.next()
		while (!step.done) {
			step = await genNested.next()
		}
		const resNested = step.value?.data || step.value
		assert.ok(resNested.success)
		assert.equal(resNested.releases.length, 1)
		assert.equal(resNested.releases[0].version, 'v1.0.0')

		// Test flat
		const cmdFlat = new ValidateCommand({ target: 'apps/flat' }, { db })
		const genFlat = cmdFlat.run()
		step = await genFlat.next()
		while (!step.done) {
			step = await genFlat.next()
		}
		const resFlat = step.value?.data || step.value
		assert.ok(resFlat.success)
		assert.equal(resFlat.releases.length, 1)
		assert.equal(resFlat.releases[0].version, 'v2.0.0')
	})

	it('ValidateCommand should render output in json format', async () => {
		const sampleMd = `---
status: work
type: minor
---
# v1.0.0 — Sample
## Робочий План та Задачі
- [x] Task 1
`
		const sampleUser = `Hours: 1.0h\nIterations: 1\nRRS: 330`

		const db = new DB({
			predefined: [
				['apps/demo/package.json', { name: 'demo', version: '1.0.0' }],
				['apps/demo/releases/1/0/v1.0.0/release.md', sampleMd],
				['apps/demo/releases/1/0/v1.0.0/user.md', sampleUser],
				['apps/demo/releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		const cmd = new ValidateCommand({ target: 'apps/demo', format: 'json' }, { db })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}
		const res = step.value?.data || step.value
		assert.ok(res.output)
		const parsed = JSON.parse(res.output)
		assert.equal(parsed.success, true)
		assert.equal(parsed.releases[0].version, 'v1.0.0')
	})

	it('ValidateCommand should render output in nan0 format', async () => {
		const sampleMd = `---
status: work
---
# v1.0.0 — Sample
## Робочий План та Задачі
- [x] Task 1
`
		const db = new DB({
			predefined: [
				['apps/demo/package.json', { name: 'demo', version: '1.0.0' }],
				['apps/demo/releases/1/0/v1.0.0/release.md', sampleMd],
				['apps/demo/releases/1/0/v1.0.0/user.md', 'Hours: 1h\nIterations: 1\nRRS: 330'],
				['apps/demo/releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		const cmd = new ValidateCommand({ target: 'apps/demo', format: 'nan0' }, { db })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}
		const res = step.value?.data || step.value
		assert.ok(res.output)
		assert.match(res.output, /version: v1\.0\.0/)
		assert.match(res.output, /status: work/)
	})

	it('ValidateCommand should render output in csv format', async () => {
		const sampleMd = `---
status: work
---
# v1.0.0 — Sample
## Робочий План та Задачі
- [x] [#101] Task Done
- [ ] [#102] Task Todo
`
		const db = new DB({
			predefined: [
				['apps/demo/package.json', { name: 'demo', version: '1.0.0' }],
				['apps/demo/releases/1/0/v1.0.0/release.md', sampleMd],
				['apps/demo/releases/1/0/v1.0.0/user.md', 'Hours: 1h\nIterations: 1\nRRS: 330'],
				['apps/demo/releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		const cmd = new ValidateCommand({ target: 'apps/demo', format: 'csv' }, { db })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}
		const res = step.value?.data || step.value
		assert.ok(res.output)
		assert.match(res.output, /Version,Task ID,Title,Status/)
		assert.match(res.output, /v1\.0\.0,101,Task Done,done/)
		assert.match(res.output, /v1\.0\.0,102,Task Todo,todo/)
	})

	it('ValidateCommand should support writing output to file via --output', async () => {
		const sampleMd = `---
status: work
---
# v1.0.0 — Sample
`
		const db = new DB({
			predefined: [
				['apps/demo/package.json', { name: 'demo', version: '1.0.0' }],
				['apps/demo/releases/1/0/v1.0.0/release.md', sampleMd],
				['apps/demo/releases/1/0/v1.0.0/user.md', 'Hours: 1h\nIterations: 1\nRRS: 330'],
				['apps/demo/releases/1/0/v1.0.0/task.spec.js', '// spec'],
			],
		})
		await db.connect()

		const cmd = new ValidateCommand({ target: 'apps/demo', format: 'json', output: 'report.json' }, { db })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}
		const saved = await db.loadDocument('report.json', null)
		assert.ok(saved)
		const parsed = typeof saved === 'object' ? saved : JSON.parse(saved)
		assert.equal(parsed.success, true)
	})

	it('ValidateCommand should be registered in ReleaseApp commands in both app and package', async () => {
		assert.ok(AppReleaseApp.command.options.includes(ValidateCommand))
		assert.ok(CoreReleaseApp.command.options.includes(ValidateCommand))
	})
})
