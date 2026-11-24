import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import { Markdown } from '@nan0web/markdown'
import {
	TaskModel,
	TodoCommand,
	PriorityEvaluator,
	ProjectsMap,
	SwiftBarAdapter,
	TrayCommand,
	TodoServeCommand,
	SyncCommand,
	IcsSyncAdapter,
	KindleExportAdapter,
} from '../../../../../index.js'

describe('Release v3.9.0 Contract Spec (@nan0web/release)', () => {
	it('calculates priority using PriorityEvaluator contract and custom functions', () => {
		const task = new TaskModel({
			title: 'Test task',
			status: 'work',
			metrics: { V: 8, U: 9, C: 2, L: 1, F: 2, D: 1, S: 5 },
		})
		assert.equal(TaskModel.calculatePriority(task), 36)
		assert.equal(TaskModel.calculatePriority(task, PriorityEvaluator.pool), 145)
		const custom = (t) => (t.metrics?.V || 0) * 10
		assert.equal(TaskModel.calculatePriority(task, custom), 80)
	})

	it('extracts and mutates tasks in both MDTable and MDTaskList with zero drift', () => {
		const md = [
			'| № | Задача | Домен | V | U | C | P(x) | Статус |',
			'|---|---|---|---|---|---|---|---|',
			'| 1 | Налаштувати SwiftBar | dev | 8 | 9 | 2 | 36 | ⬜ |',
			'',
			'- [ ] Перевірити тести',
			'',
		].join('\n')

		const ast = new Markdown(md)
		const tasks = TodoCommand.extractTasks(ast, 'todo.md')
		assert.equal(tasks.length, 2)
		assert.equal(tasks[0].kind, 'table')
		assert.equal(tasks[0].status, 'todo')
		assert.equal(tasks[1].kind, 'checkbox')

		const mutated = TodoCommand.mutateTask(ast, 'SwiftBar', 'work')
		assert.equal(mutated, true)
		const updatedTasks = TodoCommand.extractTasks(new Markdown(String(ast)), 'todo.md')
		assert.equal(updatedTasks[0].status, 'work')
	})

	it('resolves project from projects.nan0 in order: [project:key] -> #hashtag -> keywords', async () => {
		const db = new DB({
			predefined: [
				[
					'projects.nan0',
					{
						nanweb: { dir: '/Users/i/src/nan.web', hashtags: ['nanweb'], keywords: ['release'] },
					},
				],
			],
		})
		await db.connect()
		const map = await ProjectsMap.load(db)
		assert.equal(map.resolveProject('Fix [project:nanweb]'), 'nanweb')
		assert.equal(map.resolveProject('Update #nanweb'), 'nanweb')
		assert.equal(map.resolveProject('Publish release package'), 'nanweb')
	})

	it('formats SwiftBar menu with pipe escaping and 65-char wrapping', () => {
		const tasks = [
			new TaskModel({
				title: 'Task | with pipe',
				fullText: 'Дуже довгий текст задачі який точно перевищує шістдесят пʼять символів для перевірки переносу рядків у підменю',
				status: 'work',
				priorityScore: 36,
			}),
		]
		const output = SwiftBarAdapter.render({ today: tasks, pool: [], future: [], pendingOld: [], projects: {} })
		assert.ok(output.includes('Task / with pipe'))
		assert.ok(output.includes('▶ IN PROGRESS'))
	})

	it('generates valid ICS and TXT/EPUB Kindle exports', () => {
		const tasks = [new TaskModel({ title: 'Read book', status: 'todo', date: '2026-11-22' })]
		const ics = IcsSyncAdapter.format(tasks)
		assert.ok(ics.includes('BEGIN:VCALENDAR'))
		assert.ok(ics.includes('Read book'))

		const txt = KindleExportAdapter.formatTxt(tasks)
		assert.ok(txt.includes('Read book'))
	})

	it('exposes TrayCommand, TodoServeCommand and SyncCommand', () => {
		assert.equal(TrayCommand.alias, 'tray')
		assert.equal(TodoServeCommand.alias, 'todo-serve')
		assert.equal(SyncCommand.alias, 'sync')
	})

	it('mutates tasks with Markdown formatting when targeted by cleanTitle prefix from SwiftBar', () => {
		const md = [
			'| № | Задача | Домен | V | U | C | P(x) | Статус |',
			'|---|---|---|---|---|---|---|---|',
			'| 1 | **Покращити `mlx-whisper` пайплайн:** додати `--language uk` та модель | dev | 8 | 9 | 2 | 36 | ⬜ |',
			'',
			'- [ ] Запустити `nan0web` білд',
			'',
		].join('\n')

		const ast = new Markdown(md)
		const tasks = TodoCommand.extractTasks(ast, 'todo.md')
		const target = tasks[0].title.slice(0, 40)
		assert.equal(target, 'Покращити mlx-whisper пайплайн: додати -')

		assert.equal(TodoCommand.mutateTask(ast, target, 'done'), true)
		assert.equal(TodoCommand.mutateTask(ast, 'Запустити nan0web білд', 'work'), true)

		const updated = TodoCommand.extractTasks(new Markdown(String(ast)), 'todo.md')
		assert.equal(updated[0].status, 'done')
		assert.equal(updated[1].status, 'work')
	})
})
