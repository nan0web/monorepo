import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import {
	NaN0WebConfig,
	AgentEntryConfig,
	StepsConfig,
	IntentStep,
	KnowledgeStep,
	ModelStep,
	ContractStep,
	BuildStep,
	InspectStep,
	SyncStep,
} from './index.js'

/**
 * TDD Contract for NaN0WebConfig (CoCoDev Session 2).
 * Verifies:
 * 1. Cascading load (~ -> @root -> @app) via In-Memory @nan0web/db
 * 2. Compatibility with apps/nan0web.app/nan0web.nan0
 * 3. Compatibility with packages/<pkg>/nan0web.nan0 (agents)
 * 4. Validation of 7 CoCoDev steps (IntentStep .. SyncStep)
 */
describe('NaN0WebConfig Contract (CoCoDev)', () => {
	it('loads and merges cascading layers (@system, @root, @app) from In-Memory DB', async () => {
		const db = new DB()
		const systemDb = new DB({
			predefined: [
				[
					'nan0web.nan0',
					{
						locale: 'uk',
						theme: 'dark',
						steps: {
							intent: { maxCriteria: 7 },
							build: { forbidDirectFs: true },
						},
					},
				],
			],
		})
		const rootDb = new DB({
			predefined: [
				[
					'nan0web.nan0',
					{
						name: 'nan.web',
						locale: 'en',
						steps: {
							knowledge: { preferMcp: true },
						},
					},
				],
			],
		})
		const appDb = new DB({
			predefined: [
				[
					'nan0web.nan0',
					{
						appName: 'my-app',
						ui: ['cli', 'web'],
						port: 4000,
					},
				],
			],
		})
		db.mount('@system', systemDb)
		db.mount('@root', rootDb)
		db.mount('@app', appDb)
		await Promise.all([db.connect(), systemDb.connect(), rootDb.connect(), appDb.connect()])

		const config = await NaN0WebConfig.load(db, {
			layers: ['@system/nan0web.nan0', '@root/nan0web.nan0', '@app/nan0web.nan0'],
		})

		assert.equal(config instanceof NaN0WebConfig, true)
		assert.equal(config.title, 'nan.web')
		assert.equal(config.appName, 'my-app')
		assert.equal(config.locale, 'en') // @root overrides ~
		assert.equal(config.theme, 'dark') // inherited from ~
		assert.equal(config.port, 4000) // from @app
		assert.deepEqual(config.ui, ['cli', 'web'])
		assert.equal(config.steps instanceof StepsConfig, true)
		assert.equal(config.steps.intent.maxCriteria, 7)
		assert.equal(config.steps.knowledge.preferMcp, true)
		assert.equal(config.steps.build.forbidDirectFs, true)
	})

	it('is compatible with apps/nan0web.app/nan0web.nan0 schema', () => {
		const config = new NaN0WebConfig({
			appName: 'demo-app',
			dsn: 'data/',
			locale: 'uk',
			port: 3000,
			theme: 'auto',
			directoryIndex: 'README',
			ui: ['cli', 'web'],
			aliases: { '/docs': '/uk/docs' },
		})

		assert.equal(config.appName, 'demo-app')
		assert.equal(config.dsn, 'data/')
		assert.equal(config.locale, 'uk')
		assert.equal(config.port, 3000)
		assert.equal(config.theme, 'auto')
		assert.equal(config.directoryIndex, 'README')
		assert.deepEqual(config.ui, ['cli', 'web'])
		assert.deepEqual(config.aliases, { '/docs': '/uk/docs' })
	})

	it('is compatible with packages/*/nan0web.nan0 (agents)', () => {
		const config = new NaN0WebConfig({
			name: '@nan0web/ui',
			agents: [
				{
					id: 'adapter-architect',
					description: 'UI Adapter Creation (Step 4)',
					workflows: ['docs/uk/workflows/pipeline-no4-adapter.md'],
					inspectors: ['docs/uk/inspectors/inspect-web.md'],
				},
			],
		})

		assert.equal(config.title, '@nan0web/ui')
		assert.equal(config.agents.length, 1)
		assert.equal(config.agents[0] instanceof AgentEntryConfig, true)
		assert.equal(config.agents[0].id, 'adapter-architect')
		assert.deepEqual(config.agents[0].workflows, ['docs/uk/workflows/pipeline-no4-adapter.md'])
		assert.deepEqual(config.agents[0].inspectors, ['docs/uk/inspectors/inspect-web.md'])
	})

	it('validates all 7 CoCoDev steps (IntentStep .. SyncStep)', () => {
		const steps = new StepsConfig()
		assert.equal(steps.intent instanceof IntentStep, true)
		assert.equal(steps.knowledge instanceof KnowledgeStep, true)
		assert.equal(steps.model instanceof ModelStep, true)
		assert.equal(steps.contract instanceof ContractStep, true)
		assert.equal(steps.build instanceof BuildStep, true)
		assert.equal(steps.inspect instanceof InspectStep, true)
		assert.equal(steps.sync instanceof SyncStep, true)

		assert.equal(steps.intent.maxCriteria, 7)
		assert.equal(steps.knowledge.preferMcp, true)
		assert.equal(steps.model.pureDomain, true)
		assert.equal(steps.contract.inMemoryDb, true)
		assert.equal(steps.build.forbidDirectFs, true)
		assert.equal(steps.inspect.runInspect, true)
		assert.equal(steps.sync.updateIndex, true)

		assert.throws(() => {
			new IntentStep({ maxCriteria: 8 })
		}, /maxCriteria/)
	})
})
