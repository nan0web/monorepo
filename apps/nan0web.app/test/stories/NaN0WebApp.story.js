import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { NaN0WebApp, LogConfig, AppEntryConfig } from '../../src/domain/index.js'
import { runGenerator } from '@nan0web/ui'

describe('NaN0WebApp User Stories', () => {

	it('Story 1: Defaults & Alias Mapping', () => {
		const app = new NaN0WebApp()
		assert.equal(app.appName, '')
		assert.equal(app.dsn, 'data/')
		assert.equal(app.locale, 'en')
		assert.equal(app.port, 3000)
		assert.equal(app.theme, 'auto')
		assert.deepEqual(app.ui, [])
		assert.equal(app.build, 'web')
		assert.equal(app.outDir, 'dist/')

		// Test alias resolution
		const custom = NaN0WebApp.from({ name: 'sovereign-app', port: 4000 })
		assert.equal(custom.appName, 'sovereign-app')
		assert.equal(custom.port, 4000)
	})

	it('Story 2: Nested Model Hydration', () => {
		const app = NaN0WebApp.from({
			name: 'complex-app',
			log: {
				enabled: true,
				dir: 'logs-custom/',
				rotation: 'hourly',
			},
			apps: [
				{ name: 'auth', src: '@nan0/auth' },
				{ name: 'editor', src: '@nan0/editor', locale: 'uk' },
			]
		})

		assert.ok(app.log instanceof LogConfig, 'log section must be instance of LogConfig')
		assert.equal(app.log.dir, 'logs-custom/')
		assert.equal(app.log.rotation, 'hourly')

		assert.equal(app.apps.length, 2)
		assert.ok(app.apps[0] instanceof AppEntryConfig, 'apps[0] must be AppEntryConfig')
		assert.equal(app.apps[0].appName, 'auth')
		assert.equal(app.apps[1].locale, 'uk')
	})

	it('Story 3: Execution Loop - Runtime Mode', async () => {
		const app = NaN0WebApp.from({
			name: 'test-runner',
			ui: ['web'], // Activate web ui
			operation: 'run',
		})

		const events = []
		const resultData = await runGenerator(app.run(), {
			ask: async () => ({ value: {}, cancelled: false }),
			show: (intent) => {
				events.push(`show:${intent.message}`)
			},
			progress: (intent) => {
				events.push(`progress:${intent.value}/${intent.total}:${intent.message}`)
			},
			result: (intent) => intent.data,
		})

		// Verify progress steps (1 to 5 config phase, step 6 is loading runner)
		assert.ok(events.includes('progress:1/7:Initializing NaN0WebApp configuration and database...'))
		assert.ok(events.includes('progress:2/7:Creating virtual projections via aliases...'))
		assert.ok(events.includes('progress:3/7:Detecting user locale...'))
		assert.ok(events.includes('progress:4/7:Attaching and registering apps...'))
		assert.ok(events.includes('progress:5/7:Applying security limits: db.seal()...'))
		
		// Activated web UI should result in launching the web runner
		assert.ok(events.includes('progress:6/7:Loading and calling UI Runner (web)...'))
		assert.ok(events.includes('show:Operation completed successfully'))

		assert.deepEqual(resultData, {
			ok: true,
			operation: 'run',
			ui: 'web'
		})
	})

	it('Story 4: Execution Loop - Build Mode', async () => {
		const app = NaN0WebApp.from({
			name: 'test-builder',
			operation: 'build',
			build: 'swift',
		})

		const events = []
		const resultData = await runGenerator(app.run(), {
			ask: async () => ({ value: {}, cancelled: false }),
			show: (intent) => {
				events.push(`show:${intent.message}`)
			},
			progress: (intent) => {
				events.push(`progress:${intent.value}/${intent.total}:${intent.message}`)
			},
			result: (intent) => intent.data,
		})

		assert.ok(events.includes('progress:6/7:Loading and calling UI Builder (swift)...'))
		assert.ok(events.includes('show:Operation completed successfully'))

		assert.deepEqual(resultData, {
			ok: true,
			operation: 'build',
			platform: 'swift'
		})
	})

	it('Story 5: Interactive Operation Prompt', async () => {
		const app = NaN0WebApp.from({
			name: 'test-interactive',
		})

		const events = []
		const resultData = await runGenerator(app.run(), {
			ask: async (intent) => {
				events.push(`ask:${intent.field}`)
				return { value: 'build', cancelled: false }
			},
			show: () => {},
			progress: () => {},
			result: (intent) => intent.data,
		})

		// It should ask for operation since none was predefined
		assert.ok(events.includes('ask:operation'))
		assert.equal(resultData.operation, 'build')
		assert.equal(resultData.platform, 'web') // default build platform
	})
})
