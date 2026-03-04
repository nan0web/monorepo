#!/usr/bin/env node
import process from 'node:process'
import { execSync } from 'node:child_process'

import DB from '@nan0web/db-fs'
import Logger from '@nan0web/log'
import { render, Alert, Badge, Table, ProgressBar, CLiInputAdapter } from '@nan0web/ui-cli'

/* ─── Constants ───────────────────────────────────────────────────────────── */
const TASK_FILES = ['next.md', 'REQUESTS.md']
const WORKSPACE_PATTERNS = ['packages', 'apps']

/* ─── Git helpers ─────────────────────────────────────────────────────────── */
function gitStatus(dir) {
	try {
		const output = execSync('git status --porcelain', {
			cwd: dir,
			encoding: 'utf8',
			timeout: 5000,
			stdio: ['pipe', 'pipe', 'pipe'],
		})
		const lines = output.trim().split('\n').filter(Boolean)
		return {
			dirty: lines.length > 0,
			modified: lines.filter((l) => l[0] === 'M' || l[1] === 'M').length,
			added: lines.filter((l) => l.startsWith('??') || l[0] === 'A').length,
			deleted: lines.filter((l) => l[0] === 'D' || l[1] === 'D').length,
			total: lines.length,
		}
	} catch {
		return { dirty: false, error: true }
	}
}

function hasOwnGit(dir) {
	try {
		return (
			execSync('git rev-parse --show-toplevel', {
				cwd: dir,
				encoding: 'utf8',
				timeout: 3000,
				stdio: ['pipe', 'pipe', 'pipe'],
			}).trim() === dir
		)
	} catch {
		return false
	}
}

/* ─── Task parser ─────────────────────────────────────────────────────────── */
function extractTasks(content, filename) {
	return content.split('\n').reduce((tasks, line, i) => {
		const trimmed = line.trim()
		if (/^[-*]\s*\[\s\]/.test(trimmed)) {
			tasks.push({
				line: i + 1,
				text: trimmed.replace(/^[-*]\s*\[\s\]\s*/, ''),
				type: 'todo',
				file: filename,
			})
		} else if (/^[-*]\s*\[x\]/i.test(trimmed)) {
			tasks.push({
				line: i + 1,
				text: trimmed.replace(/^[-*]\s*\[x\]\s*/i, ''),
				type: 'done',
				file: filename,
			})
		}
		return tasks
	}, [])
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN GENERATOR                                                            */
/* ═══════════════════════════════════════════════════════════════════════════ */
async function* run(argv = process.argv.slice(2)) {
	const showGit = argv.includes('--git') || argv.includes('-g') || argv.length === 0
	const showRequests = argv.includes('--requests') || argv.includes('-r') || argv.length === 0
	const showHelp = argv.includes('--help') || argv.includes('-h')

	if (showHelp) {
		yield Alert({
			title: 'nan•web workspace-status',
			variant: 'info',
			children: [
				'Scan all packages and apps for uncommitted changes and pending tasks.\n',
				'Usage:  node bin/workspace-status.js [options]\n',
				'  --git, -g        Git status of projects with own repos',
				'  --requests, -r   Pending tasks from next.md / REQUESTS.md',
				'  --help, -h       This help',
			].join('\n'),
		})
		return
	}

	const ts = new Date().toLocaleString('uk-UA', { dateStyle: 'medium', timeStyle: 'short' })
	yield Logger.style(Logger.LOGO, { color: Logger.MAGENTA })
	yield Logger.style(`  workspace status  ${ts}`, { color: Logger.DIM })
	yield ''

	const rootFs = new DB()
	await rootFs.connect()

	/* ── Discovery ── */
	const projects = []
	for (const base of WORKSPACE_PATTERNS) {
		try {
			const entries = await rootFs.listDir(base, { depth: 0 })
			for (const entry of entries) {
				if (!entry.isDirectory) continue
				const projectPath = `${base}/${entry.name}`
				try {
					await rootFs.statDocument(`${projectPath}/package.json`)
					projects.push({
						path: projectPath,
						absPath: rootFs.location(projectPath),
						fs: rootFs.extract(projectPath),
					})
				} catch {
					/* no package.json */
				}
			}
		} catch {
			/* dir missing */
		}
	}
	projects.sort((a, b) => a.path.localeCompare(b.path))

	/* ═══ Git Status ═══════════════════════════════════════════════════════ */
	if (showGit) {
		yield Alert({ title: 'Git Status', variant: 'info' })
		const bar = yield ProgressBar({ total: projects.length, title: 'Scanning Git' })

		const tableData = []
		let dirtyCount = 0
		let cleanCount = 0

		for (const [i, project] of projects.entries()) {
			bar.update(i + 1)
			if (!hasOwnGit(project.absPath)) continue

			const pkg = await project.fs.loadDocument('package.json')
			const status = gitStatus(project.absPath)
			if (status.error) continue

			const changes = []
			if (status.modified) changes.push(`~${status.modified}`)
			if (status.added) changes.push(`+${status.added}`)
			if (status.deleted) changes.push(`-${status.deleted}`)

			if (status.dirty) {
				dirtyCount++
				tableData.push({
					status: Logger.style(' DIRTY ', { color: Logger.WHITE, bgColor: 'RED' }),
					package: pkg.name || project.path,
					version: `v${pkg.version}`,
					changes: changes.join(' '),
					files: `${status.total}`,
				})
			} else {
				cleanCount++
				tableData.push({
					status: Logger.style(' CLEAN ', { color: Logger.WHITE, bgColor: 'GREEN' }),
					package: Logger.style(pkg.name || project.path, { color: Logger.DIM }),
					version: Logger.style(`v${pkg.version}`, { color: Logger.DIM }),
					changes: '',
					files: '',
				})
			}
		}

		yield Table({
			data: tableData,
			columns: ['status', 'package', 'version', 'changes', 'files'],
			interactive: false,
		})

		yield `  ${Logger.style(String(dirtyCount), { color: Logger.RED })} dirty  ·  ${Logger.style(String(cleanCount), { color: Logger.GREEN })} clean  ·  ${dirtyCount + cleanCount} total\n`
	}

	/* ═══ Pending Tasks ════════════════════════════════════════════════════ */
	if (showRequests) {
		yield Alert({ title: 'Pending Tasks', variant: 'info' })
		const bar = yield ProgressBar({ total: projects.length, title: 'Scanning tasks' })

		let totalTodo = 0
		let totalDone = 0
		let projectsCount = 0

		for (const [i, project] of projects.entries()) {
			bar.update(i + 1)

			const tasks = []
			for (const file of TASK_FILES) {
				try {
					const doc = await project.fs.loadDocument(file)
					tasks.push(...extractTasks(doc?.content || String(doc || ''), file))
				} catch {
					/* missing */
				}
			}
			if (tasks.length === 0) continue

			const pkg = await project.fs.loadDocument('package.json')
			const todo = tasks.filter((t) => t.type === 'todo')
			const done = tasks.filter((t) => t.type === 'done')
			if (todo.length === 0 && done.length === 0) continue

			projectsCount++
			totalTodo += todo.length
			totalDone += done.length

			const pct = Math.round((done.length / (done.length + todo.length)) * 100)
			const pColor = pct === 100 ? Logger.GREEN : pct >= 50 ? Logger.YELLOW : Logger.RED
			const barStr = '█'.repeat(Math.round((16 * pct) / 100)).padEnd(16, '░')

			yield `  ${Logger.style(pkg.name || project.path, { color: Logger.WHITE })}  ${Logger.style('v' + pkg.version, { color: Logger.DIM })}`
			yield `  ${Logger.style(barStr.slice(0, Math.round((16 * pct) / 100)), { color: Logger.GREEN })}${Logger.style(barStr.slice(Math.round((16 * pct) / 100)), { color: Logger.DIM })}  ${Logger.style(pct + '%', { color: pColor })}  ${Logger.style(`${done.length}/${done.length + todo.length} tasks`, { color: Logger.DIM })}`

			for (const t of todo.slice(0, 5)) {
				const text = t.text.length > 61 ? t.text.slice(0, 58) + '…' : t.text
				yield `  ${Logger.style('◻', { color: Logger.YELLOW })} ${text}  ${Logger.style(`${t.file}:${t.line}`, { color: Logger.DIM })}`
			}
			if (todo.length > 5)
				yield Logger.style(`    … and ${todo.length - 5} more`, { color: Logger.DIM })
			yield ''
		}

		yield `  ${Logger.style(String(totalTodo), { color: Logger.YELLOW })} pending  ·  ${Logger.style(String(totalDone), { color: Logger.GREEN })} done  ·  ${projectsCount} projects\n`
	}

	yield Alert({ variant: 'success', children: 'workspace-status completed' })
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* RUNNER                                                                     */
/* ═══════════════════════════════════════════════════════════════════════════ */
async function main() {
	const generator = run()
	let next = await generator.next()
	while (!next.done) {
		const result = await render(next.value)
		next = await generator.next(result)
	}
}

main().catch((err) => {
	console.error(err)
	process.exit(1)
})
