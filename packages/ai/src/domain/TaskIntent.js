import { ModelAsApp } from '@nan0web/ui-cli'
import { Markdown } from '@nan0web/markdown'
import { show, ask, result } from '@nan0web/ui'
import path from 'node:path'

/**
 * TaskIntent — OLMUI Intent for executing release tasks (task.md) via agents or test contracts.
 */
export class TaskIntent extends ModelAsApp {
	static alias = 'task'
	static UI = {
		title: 'Task Runner',
		icon: '🎯',
	}

	static file = {
		help: 'Path to task.md file',
		type: 'string',
		default: 'task.md',
		positional: true,
	}

	static agent = {
		help: 'Autonomous agent executor (vibe, none)',
		type: 'string',
		default: 'vibe',
	}

	static maxTurns = {
		help: 'Maximum agent conversation turns',
		type: 'number',
		alias: 'max-turns',
		default: 30,
	}

	/**
	 * @param {Partial<TaskIntent> | Record<string, any>} [data] Initial state
	 * @param {import('@nan0web/ui').ModelAsAppOptions & Record<string, any>} [options] Model options
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, /** @type {any} */ (options))
		this.file = data.file || 'task.md'
		this.dryRun = Boolean(data.dryRun)
		this.autoApprove = data.autoApprove !== undefined ? Boolean(data.autoApprove) : true
		this.agent = data.agent || 'vibe'
		this.maxTurns = Number(data.maxTurns) || 30
	}

	/**
	 * Parses markdown task document with optional YAML frontmatter.
	 * @param {string} content
	 * @returns {{ version?: string, type?: string, status?: string, title: string, tasks: string[], content: string }}
	 */
	parseTask(content) {
		let version = ''
		let type = ''
		let status = ''
		let body = content

		// Simple frontmatter parsing
		if (content.startsWith('---')) {
			const endIdx = content.indexOf('---', 3)
			if (endIdx !== -1) {
				const header = content.substring(3, endIdx)
				body = content.substring(endIdx + 3).trim()

				const verMatch = header.match(/version:\s*(.+)/)
				if (verMatch) version = verMatch[1].trim()

				const typeMatch = header.match(/type:\s*(.+)/)
				if (typeMatch) type = typeMatch[1].trim()

				const statusMatch = header.match(/status:\s*(.+)/)
				if (statusMatch) status = statusMatch[1].trim()
			}
		}

		let title = 'Release Task'
		const titleMatch = body.match(/^#\s+(.+)$/m)
		if (titleMatch) {
			title = titleMatch[1].trim()
		}

		const tasks = []
		const lines = body.split('\n')
		let inScope = false

		for (const line of lines) {
			const trimmed = line.trim()
			if (trimmed.startsWith('##') && (trimmed.includes('Scope') || trimmed.includes('Задачі') || trimmed.includes('Tasks'))) {
				inScope = true
				continue
			} else if (inScope && trimmed.startsWith('##')) {
				inScope = false
			}

			if (inScope) {
				if (/^(\d+\.|\-|\*)\s+/.test(trimmed)) {
					tasks.push(trimmed)
				}
			}
		}

		return {
			version,
			type,
			status,
			title,
			tasks,
			content: body,
		}
	}

	/**
	 * Main execution flow for task runner.
	 */
	async *run() {
		const t = this.t || ((/** @type {string} */ str, /** @type {any} */ params) => str)
		const fs = await import('node:fs/promises')
		const { spawn } = await import('node:child_process')
		const invokingCwd = process.env.INIT_CWD || process.cwd()
		const workspaceRoot = this._?.workspaceRoot || this._?.root || invokingCwd

		const fromCwd = path.isAbsolute(this.file) ? this.file : path.resolve(invokingCwd, this.file)
		const fromWorkspace = path.isAbsolute(this.file) ? this.file : path.resolve(workspaceRoot, this.file)

		let content = ''
		let resolvedPath = fromCwd

		try {
			content = await fs.readFile(fromCwd, 'utf8')
			resolvedPath = fromCwd
		} catch {
			try {
				content = await fs.readFile(fromWorkspace, 'utf8')
				resolvedPath = fromWorkspace
			} catch {
				yield show(t('Task file {file} not found.', { file: this.file }), 'error')
				return
			}
		}

		const taskMeta = this.parseTask(content)
		yield show(`🎯 Task: ${taskMeta.title} (v${taskMeta.version || '0.0.0'})`, 'info')

		if (this.dryRun || this.agent === 'none') {
			yield show(`[Dry-Run] Validated ${taskMeta.tasks.length} scope tasks. Ready for execution.`, 'success')
			yield result({
				file: this.file,
				status: 'validated',
				title: taskMeta.title,
				tasksCount: taskMeta.tasks.length,
			})
			return
		}

		const taskDir = path.dirname(resolvedPath)
		const prompt = `Виконай завдання та критерії з файлу ${path.basename(resolvedPath)}: ${taskMeta.title}`

		yield show(`🤖 Spawning autonomous agent [${this.agent}] in ${taskDir}...`, 'info')

		const vibeArgs = [
			'-p',
			prompt,
			'--output',
			'rich',
		]

		if (this.autoApprove) {
			vibeArgs.push('--trust', '--auto-approve')
		}

		if (this.maxTurns) {
			vibeArgs.push('--max-turns', String(this.maxTurns))
		}

		const start = Date.now()
		const agentResult = await new Promise((resolve) => {
			const proc = spawn('vibe', vibeArgs, {
				cwd: taskDir,
				stdio: 'inherit',
			})

			proc.on('close', (code) => {
				const duration_ms = Date.now() - start
				if (code === 0) {
					resolve({ status: 'passed', duration_ms })
				} else {
					resolve({ status: 'failed', error: `Vibe exited with code ${code}`, duration_ms })
				}
			})

			proc.on('error', (err) => {
				const duration_ms = Date.now() - start
				resolve({ status: 'failed', error: err.message, duration_ms })
			})
		})

		if (agentResult.status === 'failed') {
			yield show(`❌ Agent execution failed: ${agentResult.error}`, 'error')
			yield result({
				file: this.file,
				status: 'failed',
				error: agentResult.error,
				title: taskMeta.title,
				duration_ms: agentResult.duration_ms,
				agent: this.agent,
			})
			return
		}

		yield show(`✔ Agent successfully finished task: ${taskMeta.title}`, 'success')
		yield result({
			file: this.file,
			status: 'passed',
			title: taskMeta.title,
			duration_ms: agentResult.duration_ms,
			agent: this.agent,
		})
	}
}
