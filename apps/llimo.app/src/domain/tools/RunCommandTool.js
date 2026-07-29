import { ModelAsApp } from '@nan0web/ui-cli'
import { show, progress, result } from '@nan0web/ui'
import { exec } from 'node:child_process'

/**
 * RunCommandTool — executes a shell command with a timeout.
 *
 * Captures stdout and stderr, returns exitCode.
 *
 * @example
 * const tool = new RunCommandTool({ command: 'pnpm test', timeout: 5000 })
 * yield* tool.run()
 */
export class RunCommandTool extends ModelAsApp {
	static alias = 'run_command'
	static UI = { title: 'Run Command', icon: '💻' }

	static command = {
		help: 'Command to execute',
		positional: true,
	}
	static cwd = {
		help: 'Current working directory',
		type: 'string',
		default: undefined,
	}
	static timeout = {
		help: 'Timeout in milliseconds',
		type: 'number',
		default: undefined,
	}

	/**
	 * @param {Record<string, any>} [data={}]
	 * @param {Record<string, any>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} Command */ this.command
		/** @type {string | undefined} Cwd */ this.cwd
		/** @type {number | undefined} Timeout */ this.timeout
	}

	/**
	 * @returns {AsyncGenerator<any, any, any>}
	 */
	async *run() {
		const cmd = this.command
		const currentCwd = this.cwd || process.cwd()
		const msLimit = this.timeout

		yield show(`Executing command: ${cmd} in ${currentCwd}`)

		/** @type {Promise<{ stdout: string, stderr: string, exitCode: number, error?: boolean }>} */
		const runPromise = new Promise((resolve) => {
			let killed = false
			const child = exec(cmd, { cwd: currentCwd }, (err, stdout, stderr) => {
				if (killed) return

				if (err) {
					resolve({
						stdout: stdout || '',
						stderr: stderr || err.message,
						exitCode: child.exitCode ?? 1,
					})
				} else {
					resolve({
						stdout: stdout || '',
						stderr: stderr || '',
						exitCode: 0,
					})
				}
			})

			if (msLimit) {
				setTimeout(() => {
					killed = true
					child.kill('SIGTERM')
					resolve({
						stdout: '',
						stderr: `Command timed out after ${msLimit}ms`,
						exitCode: 124, // Standard timeout exit code
						error: true,
					})
				}, msLimit)
			}
		})

		const out = await runPromise

		if (out.error) {
			yield show(`⚠️ Timeout: ${out.stderr}`)
		} else if (out.exitCode !== 0) {
			yield show(`⚠️ Exit code ${out.exitCode}: ${out.stderr}`)
		} else {
			yield show(out.stdout)
		}

		return result(out)
	}
}
