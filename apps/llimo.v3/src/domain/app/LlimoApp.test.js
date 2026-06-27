import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { LlimoApp } from './LlimoApp.js'
import { ChatSessionModel } from './ChatSessionModel.js'
import { StrategyApp } from '../strategy/AiStrategyModel.js'

describe('LlimoApp Command Routing & Prompt Fallback', () => {
	it('should instantiate ChatSessionModel with prompt input if no matching subcommand is found', async () => {
		const db = new DB()
		await db.connect()

		const app = new LlimoApp({
			command: 'Створи новий React компонент'
		}, {
			db,
			t: (key) => key
		})

		assert.ok(app.command instanceof ChatSessionModel)
		assert.strictEqual(app.command.input, 'Створи новий React компонент')
	})

	it('should route to StrategyApp if subcommand matches strategy alias', async () => {
		const db = new DB()
		await db.connect()

		const app = new LlimoApp({
			command: 'strategy',
			_positionals: ['list']
		}, {
			db,
			t: (key) => key
		})

		assert.ok(app.command instanceof StrategyApp)
	})

	it('should route to WorkflowApp if command matches workflow alias', async () => {
		const db = new DB()
		await db.connect()

		const app = new LlimoApp({
			command: 'workflow list'
		}, {
			db,
			t: (key) => key
		})

		const { WorkflowApp } = await import('../workflow/WorkflowApp.js')
		assert.ok(app.command instanceof WorkflowApp)
		assert.strictEqual(app.command.command.constructor.alias, 'list')
	})
})
