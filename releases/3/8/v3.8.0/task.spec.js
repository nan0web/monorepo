import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import DB from '@nan0web/db'
import {
	TaskModel,
	SwiftBarAdapter,
	TrayCommand,
	BatchCommand,
	ReleaseApp,
	DashboardModel as PkgDashboardModel,
} from '../../../../packages/release/src/index.js'
import { parseUserMetrics } from '../../../../packages/release/src/domain/Dashboard/ReleaseParser.js'
import { DashboardModel as AppDashboardModel } from '../../../../apps/release.app/src/domain/Dashboard/DashboardModel.js'

describe('Release v3.8.0 Specification — Wave 3: Enterprise SwiftBar & Parallel Telemetry', () => {
	it('TaskModel validates and serializes agent, model, tokensIn, tokensOut, costUsd, step, and gate fields', () => {
		const task = new TaskModel({
			title: 'Implement telemetry',
			status: 'work',
			agent: 'codex-1',
			model: 'gpt-5',
			tokensIn: 120000,
			tokensOut: 40000,
			costUsd: 0.85,
			step: '4/7',
			gate: 'pass',
			targetFiles: ['packages/release/src/domain/Task/TaskModel.js'],
			logPath: 'logs/task-1.log',
		})

		assert.equal(task.agent, 'codex-1')
		assert.equal(task.model, 'gpt-5')
		assert.equal(task.tokensIn, 120000)
		assert.equal(task.tokensOut, 40000)
		assert.equal(task.costUsd, 0.85)
		assert.equal(task.step, '4/7')
		assert.equal(task.gate, 'pass')
		assert.deepEqual(task.targetFiles, ['packages/release/src/domain/Task/TaskModel.js'])
		assert.equal(task.logPath, 'logs/task-1.log')
		assert.equal(TaskModel.totalTokens(task), 160000)

		const parsed = parseUserMetrics(
			'---\nagent: gemini-pro\nmodel: gemini-2.5\ntokensIn: 50000\ntokensOut: 15000\ncostUsd: 0.42\nstep: 3/6\ngate: fail\n---\n',
		)
		assert.equal(parsed.agent, 'gemini-pro')
		assert.equal(parsed.model, 'gemini-2.5')
		assert.equal(parsed.tokensIn, 50000)
		assert.equal(parsed.tokensOut, 15000)
		assert.equal(parsed.costUsd, 0.42)
		assert.equal(parsed.step, '3/6')
		assert.equal(parsed.gate, 'fail')
	})

	it('SwiftBarAdapter renders aggregate completion %, total tokens, cost in header, and task log/IDE links', () => {
		const tasks = [
			new TaskModel({
				title: 'Task A | Pipe',
				status: 'work',
				agent: 'agent-1',
				model: 'claude-4',
				tokensIn: 400000,
				tokensOut: 240000,
				costUsd: 2.15,
				step: '4/7',
				gate: 'pass',
				filePath: 'releases/3/8/v3.8.0/task.md',
				logPath: 'logs/agent-1.log',
				project: 'nanweb',
			}),
			new TaskModel({ title: 'Task B', status: 'done' }),
			new TaskModel({ title: 'Task C', status: 'todo' }),
			new TaskModel({ title: 'Task D', status: 'todo' }),
		]
		const output = SwiftBarAdapter.render({
			today: tasks,
			projects: { nanweb: { dir: '/Users/i/src/nan.web' } },
		})
		const headerLine = output.split('\n')[0]
		assert.ok(headerLine.includes('▶ 1/4 (25%)'), `Header missing progress: ${headerLine}`)
		assert.ok(headerLine.includes('$2.15'), `Header missing cost: ${headerLine}`)
		assert.ok(headerLine.includes('640k tok'), `Header missing tokens: ${headerLine}`)

		assert.ok(output.includes('Task A / Pipe'))
		assert.ok(output.includes('claude-4'))
		assert.ok(output.includes('4/7'))
		assert.ok(output.includes('open-log'))
		assert.ok(output.includes('open-antigravity'))
	})

	it('TrayCommand aggregates live run state across parallel task slots without race conditions', async () => {
		const db = new DB({
			predefined: [
				['todo.md', '- [>] Parallel task #nanweb\n- [x] Done task #nanweb\n'],
				['pool.md', ''],
				['future.md', ''],
				['projects.nan0', { nanweb: { dir: '/Users/i/src/nan.web' } }],
				[
					'.nan0release/slots/slot-1.json',
					JSON.stringify({
						target: 'Parallel task',
						agent: 'worker-1',
						model: 'gpt-5',
						tokensIn: 300000,
						tokensOut: 100000,
						costUsd: 1.5,
						step: '2/5',
						gate: 'pass',
						logPath: 'logs/slot-1.log',
					}),
				],
			],
		})
		await db.connect()

		const cmd = new TrayCommand({ action: 'render', file: 'todo.md' }, { db })
		const gen = cmd.run()
		let step = await gen.next()
		while (!step.done) step = await gen.next()
		const res = step.value?.data || step.value

		assert.equal(res.ok, true)
		assert.ok(res.output.includes('400k tok'))
		assert.ok(res.output.includes('$1.50'))
		assert.ok(res.output.includes('gpt-5'))
	})

	it('BatchCommand detects overlapping targetFiles before dispatching parallel worktrees', async () => {
		assert.ok(ReleaseApp.command.options.includes(BatchCommand), 'BatchCommand registered in ReleaseApp')

		const tasks = [
			{ id: 't1', targetFiles: ['packages/release/src/TaskModel.js', 'packages/release/src/App.js'] },
			{ id: 't2', targetFiles: ['packages/release/src/App.js', 'packages/release/src/index.js'] },
			{ id: 't3', targetFiles: ['apps/release.app/src/DashboardModel.js'] },
		]
		const conflicts = BatchCommand.detectConflicts(tasks)
		assert.equal(conflicts.length, 1)
		assert.equal(conflicts[0].file, 'packages/release/src/App.js')
		assert.deepEqual(conflicts[0].tasks, ['t1', 't2'])

		const executed = []
		const fakeSystem = {
			execGit: async (args) => {
				executed.push(args)
				return { ok: true, stdout: '', stderr: '' }
			},
		}
		const db = new DB({ predefined: [] })
		await db.connect()

		const blockedCmd = new BatchCommand({ tasks, dryRun: false }, { db, system: fakeSystem })
		const genBlocked = blockedCmd.run()
		let step = await genBlocked.next()
		while (!step.done) step = await genBlocked.next()
		const blockedRes = step.value?.data || step.value
		assert.equal(blockedRes.ok, false)
		assert.equal(blockedRes.conflicts.length, 1)
		assert.equal(executed.length, 0)

		const safeTasks = [tasks[0], tasks[2]]
		const safeCmd = new BatchCommand({ tasks: safeTasks, worktreeRoot: '.worktrees' }, { db, system: fakeSystem })
		const genSafe = safeCmd.run()
		step = await genSafe.next()
		while (!step.done) step = await genSafe.next()
		const safeRes = step.value?.data || step.value
		assert.equal(safeRes.ok, true)
		assert.equal(safeRes.dispatched.length, 2)
		assert.ok(executed.some((args) => args.includes('worktree') && args.includes('add')))
	})

	it('DashboardModel in release.app aggregates daily token and cost telemetry', async () => {
		const db = new DB({
			predefined: [
				['releases.txt', 'packages/release\n'],
				['packages/release/package.json', JSON.stringify({ name: '@nan0web/release', version: '3.8.0' })],
				[
					'packages/release/releases/3/8/v3.8.0/user.md',
					'---\nhours: 4\niterations: 3\nrrs: 90\ntokensIn: 200000\ntokensOut: 50000\ncostUsd: 1.25\nagent: worker-1\nmodel: gemini-2.5\n---\n',
				],
				['packages/release/releases/3/8/v3.8.0/task.md', '---\nstatus: wip\n---\n- [ ] Task 1\n'],
			],
		})
		await db.connect()

		const appDash = new AppDashboardModel({ registryFile: 'releases.txt' }, { db })
		const appResult = await appDash.aggregate()
		assert.equal(appResult.summary.totalTokensIn, 200000)
		assert.equal(appResult.summary.totalTokensOut, 50000)
		assert.equal(appResult.summary.totalTokens, 250000)
		assert.equal(appResult.summary.totalCostUsd, 1.25)
		assert.equal(appResult.projects[0].costUsd, 1.25)

		const pkgDash = new PkgDashboardModel({ registryFile: 'releases.txt' }, { db })
		const pkgResult = await pkgDash.aggregate()
		assert.equal(pkgResult.summary.totalTokens, 250000)
		assert.equal(pkgResult.summary.totalCostUsd, 1.25)
	})
})
