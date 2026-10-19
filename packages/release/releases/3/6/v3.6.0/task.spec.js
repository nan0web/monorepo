import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import ExampleCommand from '../../../../src/domain/ExampleCommand.js'
import InitCommand from '../../../../src/domain/InitCommand.js'
import ValidateCommand from '../../../../src/domain/ValidateCommand.js'
import { ReleaseAuditor } from '../../../../src/domain/inspect/ReleaseAuditor.js'
import { parseUserMetrics } from '../../../../src/domain/Dashboard/ReleaseParser.js'
import { ReleaseApp } from '../../../../src/domain/App.js'

describe('Release v3.6.0 Contract: Canonical Release Example, Flexible Auditor & Target Resolution', () => {
	it('task-1: ExampleCommand returns canonical release structure and renders files', async () => {
		const example = new ExampleCommand()
		const template = example.getTemplate('v1.0.0')

		assert.ok(template.taskMd.includes('---'))
		assert.ok(template.taskMd.includes('# 🚀 Mission:'))
		assert.ok(template.userMd.includes('---'))
		assert.ok(template.userMd.includes('hours:'))
		assert.ok(template.userMd.includes('iterations:'))
		assert.ok(template.userMd.includes('rrs:'))
		assert.ok(template.taskSpecJs.includes('node:test'))

		// Check registration in App commands
		assert.ok(ReleaseApp.command.options.includes(ExampleCommand))
	})

	it('task-2: InitCommand generates full valid release files with frontmatter metrics that pass validation', async () => {
		const db = new DB()
		await db.connect()

		const init = new InitCommand({ version: 'v0.5.0' }, { db })
		const gen = init.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}

		const res = step.value?.data || step.value
		assert.equal(res.version, 'v0.5.0')

		const taskDoc = String(await db.loadDocument('releases/0/5/v0.5.0/task.md', ''))
		const userDoc = String(await db.loadDocument('releases/0/5/v0.5.0/user.md', ''))
		const specDoc = String(await db.loadDocument('releases/0/5/v0.5.0/task.spec.js', ''))

		assert.ok(taskDoc.includes('---'))
		assert.ok(taskDoc.includes('version: 0.5.0'))
		assert.ok(userDoc.includes('hours:'))
		assert.ok(userDoc.includes('iterations:'))
		assert.ok(userDoc.includes('rrs:'))
		assert.ok(specDoc.includes('node:test'))
	})

	it('task-3: ValidateCommand resolves project root when target points to releases folder', async () => {
		const db = new DB({
			predefined: [
				['apps/my-app/package.json', { name: 'my-app', version: '0.1.0' }],
				['apps/my-app/releases/0/1/v0.1.0/task.md', '# v0.1.0 - First\n- [x] T1\n'],
				['apps/my-app/releases/0/1/v0.1.0/user.md', '---\nhours: 2\niterations: 3\nrrs: 330\n---\n# Feedback\n'],
				['apps/my-app/releases/0/1/v0.1.0/task.spec.js', "import { test } from 'node:test'\ntest('ok', () => {})\n"],
			],
		})
		await db.connect()

		// Target is specified directly as releases folder
		const validateCmd = new ValidateCommand({ target: 'apps/my-app/releases' }, { db })
		const gen = validateCmd.run()
		let step = await gen.next()
		while (!step.done) {
			step = await gen.next()
		}
		const res = step.value?.data || step.value
		assert.ok(res.success, 'Validation should succeed when targeting releases folder without missing package.json error')
	})

	it('task-4: ReleaseAuditor and parseUserMetrics flexibly parse user.md metrics from frontmatter and body', async () => {
		const fmOnly = `---
hours: 3.5
iterations: 7
rrs: 340
---
# Architect Log
- Iteration done
`
		const m1 = parseUserMetrics(fmOnly)
		assert.equal(m1.hours, 3.5)
		assert.equal(m1.iterations, 7)
		assert.equal(m1.rrs, 340)

		const ukBody = `# Метрики
- **Час роботи (Hours):** 4.0
- **Ітерацій (Iterations):** 8
- **RRS (Release Readiness Score):** 350
`
		const m2 = parseUserMetrics(ukBody)
		assert.equal(m2.hours, 4.0)
		assert.equal(m2.iterations, 8)
		assert.equal(m2.rrs, 350)
	})

	it('task-6: ReleaseAuditor recognizes *.spec.js, *.test.js, *.story.js, src/tests/releases/ (OK), warns for src/test/releases/ (WARN), and errors for src/releases/ (ERROR)', async () => {
		// Test A: src/tests/releases/ is valid (OK)
		const dbOk = new DB({
			predefined: [
				['packages/ok-pkg/package.json', { name: 'ok-pkg', version: '1.0.0' }],
				['packages/ok-pkg/releases/1/0/v1.0.0/task.md', '# v1.0.0\n- [x] T1\n'],
				['packages/ok-pkg/releases/1/0/v1.0.0/user.md', '---\nhours: 1\niterations: 2\nrrs: 330\n---\n'],
				['packages/ok-pkg/src/tests/releases/1/0/v1.0.0/task.test.js', '// test'],
			],
		})
		await dbOk.connect()

		const auditorOk = new ReleaseAuditor({ dir: 'packages/ok-pkg' }, { db: dbOk })
		await auditorOk.init()
		const genOk = auditorOk.run()
		let step = await genOk.next()
		while (!step.done) step = await genOk.next()
		const resOk = step.value?.data || step.value
		assert.ok(resOk.success, 'src/tests/releases/ should be valid without errors')
		assert.equal(resOk.errors.length, 0)
		assert.equal(resOk.warnings.length, 0)

		// Test B: src/test/releases/ produces a warning (WARN)
		const dbWarn = new DB({
			predefined: [
				['packages/warn-pkg/package.json', { name: 'warn-pkg', version: '1.0.0' }],
				['packages/warn-pkg/releases/1/0/v1.0.0/task.md', '# v1.0.0\n- [x] T1\n'],
				['packages/warn-pkg/releases/1/0/v1.0.0/user.md', '---\nhours: 1\niterations: 2\nrrs: 330\n---\n'],
				['packages/warn-pkg/src/test/releases/1/0/v1.0.0/task.test.js', '// test'],
			],
		})
		await dbWarn.connect()

		const auditorWarn = new ReleaseAuditor({ dir: 'packages/warn-pkg' }, { db: dbWarn })
		await auditorWarn.init()
		const genWarn = auditorWarn.run()
		step = await genWarn.next()
		while (!step.done) step = await genWarn.next()
		const resWarn = step.value?.data || step.value
		assert.ok(resWarn.success, 'src/test/releases/ still counts as valid regression')
		const warnCodes = resWarn.warnings.map((w) => w.code)
		assert.ok(
			warnCodes.includes('DEPRECATED_TEST_LOCATION'),
			'src/test/releases/ should produce DEPRECATED_TEST_LOCATION warning'
		)

		// Test C: src/releases/ produces an error (ERROR)
		const dbErr = new DB({
			predefined: [
				['packages/err-pkg/package.json', { name: 'err-pkg', version: '1.0.0' }],
				['packages/err-pkg/releases/1/0/v1.0.0/task.md', '# v1.0.0\n- [x] T1\n'],
				['packages/err-pkg/releases/1/0/v1.0.0/user.md', '---\nhours: 1\niterations: 2\nrrs: 330\n---\n'],
				['packages/err-pkg/src/releases/1/0/v1.0.0/task.test.js', '// test'],
			],
		})
		await dbErr.connect()

		const auditorErr = new ReleaseAuditor({ dir: 'packages/err-pkg' }, { db: dbErr })
		await auditorErr.init()
		const genErr = auditorErr.run()
		step = await genErr.next()
		while (!step.done) step = await genErr.next()
		const resErr = step.value?.data || step.value
		assert.equal(resErr.success, false, 'src/releases/ must produce error')
		const errCodes = resErr.errors.map((e) => e.code)
		assert.ok(
			errCodes.includes('DIRTY_SRC_RELEASES'),
			'src/releases/ must produce DIRTY_SRC_RELEASES error'
		)

		// Test D: recognizes *.spec.js, *.test.js, *.story.js inside release
		const dbStory = new DB({
			predefined: [
				['packages/story-pkg/package.json', { name: 'story-pkg', version: '1.0.0' }],
				['packages/story-pkg/releases/1/0/v1.0.0/task.md', '# v1.0.0\n- [x] T1\n'],
				['packages/story-pkg/releases/1/0/v1.0.0/user.md', '---\nhours: 1\niterations: 2\nrrs: 330\n---\n'],
				['packages/story-pkg/releases/1/0/v1.0.0/ReleaseAuditor.story.js', '// story test'],
			],
		})
		await dbStory.connect()

		const auditorStory = new ReleaseAuditor({ dir: 'packages/story-pkg' }, { db: dbStory })
		await auditorStory.init()
		const genStory = auditorStory.run()
		step = await genStory.next()
		while (!step.done) step = await genStory.next()
		const resStory = step.value?.data || step.value
		assert.ok(resStory.success, 'Release with *.story.js should be recognized as having a valid contract')
	})

	it('task-7: CloseCommand migrates closed specs to src/tests/releases/', async () => {
		const db = new DB({
			predefined: [
				['packages/my-lib/package.json', { name: 'my-lib', version: '1.0.0' }],
				['packages/my-lib/releases/1/0/v1.0.0/task.md', '# v1.0.0\n- [x] T1\n'],
				['packages/my-lib/releases/1/0/v1.0.0/task.spec.js', '// spec content'],
			],
		})
		await db.connect()

		const CloseCommandModule = (await import('../../../../src/domain/CloseCommand.js')).default
		const closeCmd = new CloseCommandModule({ version: 'v1.0.0' }, { db })
		// Test helper method calculateDestination
		const dest = closeCmd.getDestinationPath('packages/my-lib/releases/1/0/v1.0.0/task.spec.js')
		assert.equal(dest, 'packages/my-lib/src/tests/releases/1/0/v1.0.0/task.test.js')
	})

	it('task-8: ReleaseApp uses ViewCommand as default command and executes cleanly via ModelAsApp', async () => {
		const db = new DB({
			predefined: [
				['releases/0/1/v0.1.0/task.md', '# v0.1.0\n- [x] Done\n'],
				['releases/0/1/v0.1.0/user.md', '---\nhours: 1\niterations: 1\nrrs: 330\n---\n'],
				['releases/0/1/v0.1.0/task.spec.js', '// spec\n'],
				['package.json', { name: 'test-app', version: '0.1.0' }],
			],
		})
		await db.connect()

		// 1. Default command is ViewCommand
		const appDefault = new ReleaseApp({}, { db })
		const ViewCommandModule = (await import('../../../../src/domain/ViewCommand.js')).default
		assert.equal(ReleaseApp.command.default, ViewCommandModule)
		assert.ok(
			appDefault.command instanceof ViewCommandModule,
			'Default invocation should instantiate ViewCommand'
		)

		// 2. Explicit validate command execution
		const appValidate = new ReleaseApp({ command: 'validate' }, { db })
		assert.ok(
			appValidate.command instanceof ValidateCommand,
			'Explicit validate command should instantiate ValidateCommand'
		)
	})
})


