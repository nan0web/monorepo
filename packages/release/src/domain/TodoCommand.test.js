import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Markdown } from '@nan0web/markdown'
import { TodoCommand } from './TodoCommand.js'

describe('TodoCommand (MDTable & MDTaskList)', () => {
	it('extracts and mutates tasks from MDTable', () => {
		const md = [
			'| № | Задача | Домен | V | U | C | P(x) | Статус |',
			'| --- | --- | --- | --- | --- | --- | --- | --- |',
			'| 1 | Налаштувати SwiftBar | dev | 8 | 9 | 2 | 36 | ⬜ |',
		].join('\n')
		const ast = new Markdown(md)
		const tasks = TodoCommand.extractTasks(ast, 'todo.md')
		assert.equal(tasks.length, 1)
		assert.equal(tasks[0].kind, 'table')
		assert.equal(tasks[0].status, 'todo')
		assert.equal(TodoCommand.mutateTask(ast, 'SwiftBar', 'work'), true)
		const updated = TodoCommand.extractTasks(new Markdown(String(ast)), 'todo.md')
		assert.equal(updated[0].status, 'work')
	})

	it('extracts and mutates tasks from MDTaskList', () => {
		const md = '- [ ] Перевірити тести\n- [x] Готово\n'
		const ast = new Markdown(md)
		const tasks = TodoCommand.extractTasks(ast, 'todo.md')
		assert.equal(tasks.length, 2)
		assert.equal(tasks[0].kind, 'checkbox')
		assert.equal(TodoCommand.mutateTask(ast, 'Перевірити', 'done'), true)
		const updated = TodoCommand.extractTasks(new Markdown(String(ast)), 'todo.md')
		assert.equal(updated[0].status, 'done')
	})
})
