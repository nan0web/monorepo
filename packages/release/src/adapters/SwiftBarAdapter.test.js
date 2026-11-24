import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { TaskModel } from '../domain/Task/TaskModel.js'
import { SwiftBarAdapter } from './SwiftBarAdapter.js'

describe('SwiftBarAdapter', () => {
	it('escapes pipes and wraps fullText at 65 chars', () => {
		const tasks = [
			new TaskModel({
				title: 'A | B',
				fullText: '1234567890 '.repeat(8).trim(),
				status: 'work',
				priorityScore: 12,
			}),
		]
		const out = SwiftBarAdapter.render({ today: tasks, pool: [], future: [], pendingOld: [], projects: {} })
		assert.ok(out.includes('A / B'))
		const subLines = out.split('\n').filter((l) => l.startsWith('--1234567890'))
		assert.ok(subLines.length >= 2)
		assert.ok(subLines.every((l) => l.split('|')[0].trim().length <= 67))
	})
})
