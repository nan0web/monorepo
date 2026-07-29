import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { NaN0WebApp, LogConfig, AppEntryConfig } from './index.js'
import { ModelError } from '@nan0web/types'

describe('NaN0WebApp', () => {
	// ── SECTION 1: Default Values and Configurations (Tests 1-5) ──

	it('1. should use default configuration values', () => {
		const app = new NaN0WebApp()
		assert.equal(app.appName, '')
		assert.equal(app.dsn, 'data/')
		assert.equal(app.locale, 'en')
		assert.equal(app.port, 3000)
		assert.equal(app.theme, 'auto')
		assert.equal(app.ssl, null)
		assert.deepEqual(app.apps, [])
		assert.deepEqual(app.aliases, {})
		assert.deepEqual(app.ui, [])
		assert.equal(app.build, 'web')
		assert.equal(app.outDir, 'dist/')
		assert.equal(app.operation, '')
	})

	it('2. should support name alias for appName', () => {
		const app = NaN0WebApp.from({ name: 'my-sovereign-app' })
		assert.equal(app.appName, 'my-sovereign-app')
	})

	it('3. should preserve other config fields during instantiation', () => {
		const app = NaN0WebApp.from({ name: 'preservation', theme: 'dark', port: 4000 })
		assert.equal(app.appName, 'preservation')
		assert.equal(app.theme, 'dark')
		assert.equal(app.port, 4000)
	})

	it('4. should correctly hydrate nested log config', () => {
		const app = new NaN0WebApp({
			appName: 'log-test',
			log: {
				dir: 'custom-logs/',
				level: 'debug'
			}
		})
		assert.ok(app.log instanceof LogConfig)
		assert.equal(app.log.dir, 'custom-logs/')
	})

	it('5. should correctly hydrate nested apps array config', () => {
		const app = new NaN0WebApp({
			appName: 'multi-app',
			apps: [
				{ name: 'auth', src: '@nan0web/auth.app' },
				{ name: 'editor', src: '@nan0web/editor.app', locale: 'uk' }
			]
		})
		assert.equal(app.apps.length, 2)
		assert.ok(app.apps[0] instanceof AppEntryConfig)
		assert.equal(app.apps[0].name, 'auth')
		assert.equal(app.apps[1].locale, 'uk')
	})

	// ── SECTION 2: Model Validation Rules (Tests 6-7) ──

	it('6. should validate correctly - throw ModelError when required appName is empty', () => {
		const app = new NaN0WebApp()
		assert.throws(() => {
			app.validate()
		}, (err) => {
			assert.ok(err instanceof ModelError)
			assert.ok(err.fields.appName)
			return true
		})
	})

	it('7. should validate correctly - pass when appName is non-empty', () => {
		const app = new NaN0WebApp({ appName: 'valid-app' })
		assert.equal(app.validate(), true)
	})

	// ── SECTION 3: Static from() Method Variations (Tests 8-10) ──

	it('8. should support NaN0WebApp.from() with a direct object', () => {
		const app = NaN0WebApp.from({ name: 'direct-obj', port: 1234 })
		assert.ok(app instanceof NaN0WebApp)
		assert.equal(app.appName, 'direct-obj')
		assert.equal(app.port, 1234)
	})

	it('9. should support NaN0WebApp.from() with an existing NaN0WebApp instance', () => {
		const first = new NaN0WebApp({ appName: 'existing-instance' })
		const second = NaN0WebApp.from(first)
		assert.equal(second, first)
		assert.equal(second.appName, 'existing-instance')
	})

	it('10. should support NaN0WebApp.from() with null or invalid input', () => {
		const app1 = NaN0WebApp.from(null)
		assert.ok(app1 instanceof NaN0WebApp)
		assert.equal(app1.appName, '')

		const app2 = NaN0WebApp.from('invalid-string')
		assert.ok(app2 instanceof NaN0WebApp)
		assert.equal(app2.appName, '')
	})

	// ── SECTION 4: Help Mode (Tests 11-12) ──

	it('11. should yield help content when help flag is true', async () => {
		const app = new NaN0WebApp({ appName: 'helper', help: true })
		const iterator = app.run()

		const intent = await iterator.next()
		assert.equal(intent.value.type, 'ask')
		assert.equal(intent.value.field, 'help')
		assert.ok(intent.value.schema.title.includes('Help'))

		const resultIntent = await iterator.next()
		assert.equal(resultIntent.done, true)
		assert.equal(resultIntent.value.type, 'result')
	})

	it('12. should yield raw help content when help and raw flags are both true', async () => {
		const app = new NaN0WebApp({ appName: 'helper', help: true })
		app.raw = true
		const iterator = app.run()

		const intent = await iterator.next()
		assert.equal(intent.value.type, 'show')
		assert.equal(intent.value.level, 'info')
		assert.equal(intent.value.raw, true)

		const resultIntent = await iterator.next()
		assert.equal(resultIntent.done, true)
		assert.equal(resultIntent.value.type, 'result')
	})

	// ── SECTION 5: Generator Steps and Run/Build Flows (Tests 13-32) ──

	it('13. run flow: should yield progress steps 1 to 5 during initialization', async () => {
		const app = new NaN0WebApp({ appName: 'steps-test', operation: 'run' })
		const iterator = app.run()

		// Step 1: Initialize configuration and database
		let step = await iterator.next()
		assert.equal(step.done, false)
		assert.equal(step.value.type, 'progress')
		assert.equal(step.value.value, 1)

		// Step 2: Create virtual projections via aliases
		step = await iterator.next()
		assert.equal(step.value.type, 'progress')
		assert.equal(step.value.value, 2)

		// Step 3: Detect user locale
		step = await iterator.next()
		assert.equal(step.value.type, 'progress')
		assert.equal(step.value.value, 3)

		// Step 4: Attach and register domain apps
		step = await iterator.next()
		assert.equal(step.value.type, 'progress')
		assert.equal(step.value.value, 4)

		// Step 5: Apply security limits via db.seal()
		step = await iterator.next()
		assert.equal(step.value.type, 'progress')
		assert.equal(step.value.value, 5)
	})

	it('14. run flow: should ask for operation if not pre-specified', async () => {
		const app = new NaN0WebApp({ appName: 'ask-op' })
		const iterator = app.run()

		// Skip steps 1-5
		for (let i = 0; i < 5; i++) {
			await iterator.next()
		}

		// Step 6: Ask for operation
		const step = await iterator.next()
		assert.equal(step.value.type, 'ask')
		assert.equal(step.value.field, 'operation')
		assert.ok(step.value.schema.options)
	})

	it('15. run flow: default operation selection leads to running with "cli" mode', async () => {
		const app = new NaN0WebApp({ appName: 'default-cli' })
		const iterator = app.run()

		// Skip steps 1-5
		for (let i = 0; i < 5; i++) {
			await iterator.next()
		}

		// Step 6: Ask for operation - mock response as empty/run
		let step = await iterator.next()
		step = await iterator.next({ value: '' }) // defaults to 'run'

		// Step 7: Running UI message (progress)
		assert.equal(step.value.type, 'progress')
		assert.equal(step.value.value, 6)
		assert.ok(step.value.message.includes('cli'))

		// Step 8: Success Toast (show)
		step = await iterator.next()
		assert.equal(step.value.type, 'show')
		assert.equal(step.value.level, 'success')

		// Final return value
		const final = await iterator.next()
		assert.equal(final.done, true)
		assert.equal(final.value.type, 'result')
		assert.equal(final.value.data.ok, true)
		assert.equal(final.value.data.operation, 'run')
		assert.equal(final.value.data.ui, 'cli')
	})

	it('16. run flow: pre-selected operation "run" with web=true runs "web"', async () => {
		const app = new NaN0WebApp({ appName: 'web-test', operation: 'run', ui: ['web'] })
		const iterator = app.run()

		// Skip steps 1-5
		for (let i = 0; i < 5; i++) {
			await iterator.next()
		}

		// Step 6: Skip ask operation since operation is set to 'run'
		let step = await iterator.next()
		assert.equal(step.value.type, 'progress')
		assert.ok(step.value.message.includes('web'))

		step = await iterator.next()
		assert.equal(step.value.type, 'show')

		const final = await iterator.next()
		assert.equal(final.value.data.ui, 'web')
	})

	it('17. run flow: pre-selected operation "run" with api=true runs "api"', async () => {
		const app = new NaN0WebApp({ appName: 'api-test', operation: 'run', ui: ['api'] })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('api'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.ui, 'api')
	})

	it('18. run flow: pre-selected operation "run" with chat=true runs "chat"', async () => {
		const app = new NaN0WebApp({ appName: 'chat-test', operation: 'run', ui: ['chat'] })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('chat'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.ui, 'chat')
	})

	it('19. run flow: pre-selected operation "run" with voice=true runs "voice"', async () => {
		const app = new NaN0WebApp({ appName: 'voice-test', operation: 'run', ui: ['voice'] })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('voice'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.ui, 'voice')
	})

	it('20. run flow: pre-selected operation "run" with cli=true runs "cli"', async () => {
		const app = new NaN0WebApp({ appName: 'cli-explicit', operation: 'run', ui: ['cli'] })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('cli'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.ui, 'cli')
	})

	it('21. run flow: pre-selected operation "build" with build="web" builds "web"', async () => {
		const app = new NaN0WebApp({ appName: 'build-web', operation: 'build', build: 'web' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.equal(step.value.type, 'progress')
		assert.ok(step.value.message.includes('web'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.operation, 'build')
		assert.equal(final.value.data.platform, 'web')
	})

	it('22. run flow: pre-selected operation "build" with build="swift" builds "swift"', async () => {
		const app = new NaN0WebApp({ appName: 'build-swift', operation: 'build', build: 'swift' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('swift'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.platform, 'swift')
	})

	it('23. run flow: pre-selected operation "build" with build="kotlin" builds "kotlin"', async () => {
		const app = new NaN0WebApp({ appName: 'build-kotlin', operation: 'build', build: 'kotlin' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('kotlin'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.platform, 'kotlin')
	})

	it('24. run flow: pre-selected operation "build" with build="api" builds "api"', async () => {
		const app = new NaN0WebApp({ appName: 'build-api', operation: 'build', build: 'api' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('api'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.platform, 'api')
	})

	it('25. run flow: pre-selected operation "build" with build="vscode" builds "vscode"', async () => {
		const app = new NaN0WebApp({ appName: 'build-vscode', operation: 'build', build: 'vscode' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('vscode'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.platform, 'vscode')
	})

	it('26. run flow: pre-selected operation "build" with build="all" builds "all"', async () => {
		const app = new NaN0WebApp({ appName: 'build-all', operation: 'build', build: 'all' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.ok(step.value.message.includes('all'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.platform, 'all')
	})

	it('27. run flow: ask operation choice "build" runs static build platform', async () => {
		const app = new NaN0WebApp({ appName: 'ask-build', build: 'swift' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.equal(step.value.type, 'ask')

		// Mock answer: build
		step = await iterator.next({ value: 'build' })
		assert.equal(step.value.type, 'progress')
		assert.ok(step.value.message.includes('swift'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.operation, 'build')
		assert.equal(final.value.data.platform, 'swift')
	})

	it('28. run flow: ask operation choice default/empty defaults to "run"', async () => {
		const app = new NaN0WebApp({ appName: 'ask-run' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		let step = await iterator.next()
		assert.equal(step.value.type, 'ask')

		// Mock answer: null/empty -> defaults to 'run'
		step = await iterator.next({ value: null })
		assert.equal(step.value.type, 'progress')
		assert.ok(step.value.message.includes('cli'))

		await iterator.next()
		const final = await iterator.next()
		assert.equal(final.value.data.operation, 'run')
	})

	it('29. run flow: custom translation function in options is called for progress steps', async () => {
		const translationKeys = []
		const tMock = (key, params) => {
			translationKeys.push(key)
			if (params) {
				return `mocked-val-${key}-${JSON.stringify(params)}`
			}
			return `mocked-val-${key}`
		}

		const app = new NaN0WebApp({ appName: 'trans-progress', operation: 'run' }, { t: tMock })
		const iterator = app.run()

		let step = await iterator.next()
		assert.equal(step.value.message, 'mocked-val-Initializing NaN0WebApp configuration and database...')

		step = await iterator.next()
		assert.equal(step.value.message, 'mocked-val-Creating virtual projections via aliases...')

		// Verify translationKeys got populated
		assert.ok(translationKeys.includes('Initializing NaN0WebApp configuration and database...'))
		assert.ok(translationKeys.includes('Creating virtual projections via aliases...'))
	})

	it('30. run flow: custom translation function in options is called for show steps', async () => {
		const tMock = (key, params) => {
			if (key === 'Operation completed successfully') return 'SUCCESS_TRANSLATED'
			if (params) return `MOCKED_${JSON.stringify(params)}`
			return `MOCKED_${key}`
		}

		const app = new NaN0WebApp({ appName: 'trans-show', operation: 'run' }, { t: tMock })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		await iterator.next() // progress loading UI

		const step = await iterator.next() // Success Toast (show)
		assert.equal(step.value.type, 'show')
		assert.equal(step.value.message, 'SUCCESS_TRANSLATED')
	})

	it('31. run flow: correct return results for run operation', async () => {
		const app = new NaN0WebApp({ appName: 'res-run', operation: 'run', ui: ['web'] })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		await iterator.next() // progress
		await iterator.next() // show

		const resultIntent = await iterator.next()
		assert.equal(resultIntent.done, true)
		assert.deepEqual(resultIntent.value.data, {
			ok: true,
			operation: 'run',
			ui: 'web'
		})
	})

	it('32. run flow: correct return results for build operation', async () => {
		const app = new NaN0WebApp({ appName: 'res-build', operation: 'build', build: 'kotlin' })
		const iterator = app.run()

		for (let i = 0; i < 5; i++) await iterator.next()
		await iterator.next() // progress
		await iterator.next() // show

		const resultIntent = await iterator.next()
		assert.equal(resultIntent.done, true)
		assert.deepEqual(resultIntent.value.data, {
			ok: true,
			operation: 'build',
			platform: 'kotlin'
		})
	})
})
