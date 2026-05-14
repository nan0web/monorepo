import { Model } from '@nan0web/types'
import { resolveDefaults, resolveAliases } from '@nan0web/types'
import { WorkflowStepModel } from './WorkflowStepModel.js'
import { SecurityGateModel } from './SecurityGateModel.js'

/**
 * WorkflowModel - LLiMo execution logic.
 * Orchestrates steps, enforces security, and detects environment registries.
 */
export class WorkflowModel extends Model {
	static filename = {
		help: 'Path to .md workflow',
		default: '',
		type: 'string',
		positional: true,
		errorOnlyMd: 'Must reject non .md files',
		validate: (v) =>
			typeof v === 'string' && v.endsWith('.md') ? true : WorkflowModel.filename.errorOnlyMd,
	}
	static sandbox = { help: 'Sandbox mode', default: 'none' }
	static debug = { help: 'Debug mode', default: false, type: 'boolean' }
	static quiet = { help: 'Quiet mode', default: false, type: 'boolean' }
	static budget = { help: 'Execution budget limit', default: 1.0, type: 'number' }
	static steps = { help: 'Execution steps', default: [], type: 'array' }
	static historyDir = {
		help: 'Directory to store run history',
		default: '~/.llimo',
		type: 'string',
	}

	static UI = {
		init: 'Workflow initialization: {$file}',
		processing: 'Processing step: {$command} {$args}',
		executing: 'Executing: {$command} {$args}',
		success: '{$command} {$args} [Success]',
		fail: '{$command} {$args} [Failed]',
		finished: 'Workflow successfully finished in {$seconds} seconds.',
		errorNoDb: 'Database not connected.',
		errorSecurity: 'Security Violation: {$error}',
		errorNoProxy: 'Proxy not implemented: {$proxy}',
	}

	/**
	 * @param {Partial<WorkflowModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} options
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {string} Path to .md workflow */ this.filename
		/** @type {any} Sandbox mode */ this.sandbox
		/** @type {boolean} Debug mode */ this.debug
		/** @type {boolean} Quiet mode */ this.quiet
		/** @type {number} Execution budget limit */ this.budget
		/** @type {WorkflowStepModel[]} Execution steps */ this.steps
		/** @type {string} Directory to store run history */ this.historyDir
		if (this.steps && Array.isArray(this.steps)) {
			this.steps = this.steps.map((s) =>
				s instanceof WorkflowStepModel ? s : new WorkflowStepModel(s),
			)
		}
	}

	async _detectRegistry() {
		const db = /** @type {any} */ (this._).db
		const [npm, pnpm, yarn, cargo, go, cmake] = await Promise.all([
			db.stat('package.json').then((s) => s.exists),
			db.stat('pnpm-workspace.yaml').then((s) => s.exists),
			db.stat('yarn.lock').then((s) => s.exists),
			db.stat('Cargo.toml').then((s) => s.exists),
			db.stat('go.mod').then((s) => s.exists),
			db.stat('CMakeLists.txt').then((s) => s.exists),
		])
		if (pnpm) return 'pnpm'
		if (yarn) return 'yarn'
		if (npm) return 'npm'
		if (cargo) return 'cargo'
		if (go) return 'go'
		if (cmake) return 'cmake'
		return 'npm'
	}

	async _parseSteps(filepath) {
		const db = /** @type {any} */ (this._).db
		const doc = await db.fetch(filepath)
		const raw = typeof doc === 'string' ? doc : doc?.content || ''
		return raw
			.split('\n')
			.map((line) => {
				const trimmed = line.trim()
				if (!trimmed.startsWith('- @')) return null
				const parts = trimmed.replace('- ', '').split(' ')
				return new WorkflowStepModel({ command: parts[0], args: parts.slice(1) })
			})
			.filter(Boolean)
	}

	async *run() {
		const start = Date.now()
		const { t = (/** @type {any} */ v) => v, db } = /** @type {any} */ (this._)
		yield { type: 'progress', message: t(WorkflowModel.UI.init, { $file: this.filename }) }

		if (!db) throw new Error(t(WorkflowModel.UI.errorNoDb))

		const steps = await this._parseSteps(this.filename)
		const registry = await this._detectRegistry()
		const history = []

		for (const step of steps) {
			yield {
				type: 'progress',
				message: t(WorkflowModel.UI.processing, {
					$command: step.command,
					$args: step.args.join(' '),
				}),
			}

			const securityCheck = SecurityGateModel.validate(step.command, step.args)
			if (securityCheck !== true) {
				yield {
					type: 'log',
					level: 'error',
					message: t(WorkflowModel.UI.errorSecurity, { $error: securityCheck }),
				}
				return { type: 'result', data: { status: 'failed', reason: 'security_violation' } }
			}

			let cmd = step.command
			let args = [...step.args]

			if (cmd === '@llimo') {
				const action = args[0]
				const extra = args.slice(1)
				if (['pnpm', 'npm', 'yarn'].includes(registry)) {
					cmd = registry
					if (['install', 'i'].includes(action)) args = ['install', ...extra]
					else if (action === 'test') args = ['test', ...extra]
					else args = ['run', action, ...extra]
				} else if (registry === 'cargo') {
					cmd = 'cargo'
					args = [action, ...extra]
				} else if (registry === 'go') {
					cmd = 'go'
					args = [action, ...extra]
				} else if (registry === 'cmake') {
					if (action === 'build') { cmd = 'cmake'; args = ['--build', 'build', ...extra] }
					else if (action === 'test') { cmd = 'ctest'; args = ['--test-dir', 'build', ...extra] }
					else { cmd = 'cmake'; args = [action, ...extra] }
				}
			} else if (cmd === '@bash') {
				cmd = args[0]
				args = args.slice(1)
			} else if (cmd === '@ls') {
				cmd = 'ls'
			} else if (cmd === '@web' || cmd === '@get') {
				yield {
					type: 'log',
					level: 'info',
					message: t(WorkflowModel.UI.errorNoProxy, { $proxy: cmd }),
				}
				continue
			}

			const response = yield {
				type: 'ask',
				field: 'execute_step',
				command: cmd,
				args: args,
				quiet: this.quiet,
			}

			const success = response.status === 'ok' && response.exitCode === 0
			history.push({
				step,
				success,
				output: response.stdout || response.error,
				duration: Date.now() - start,
			})

			if (success) {
				yield {
					type: 'log',
					level: 'success',
					message: t(WorkflowModel.UI.success, {
						$command: step.command,
						$args: step.args.join(' '),
					}),
				}
			} else {
				yield {
					type: 'log',
					level: 'error',
					message: t(WorkflowModel.UI.fail, {
						$command: step.command,
						$args: step.args.join(' '),
					}),
				}
				if (this.debug)
					yield {
						type: 'log',
						level: 'error',
						message: (response.stderr || response.stdout || '').split('\n').slice(-9).join('\n'),
					}
				await db.saveDocument('.llimo-error.log', response.stderr || response.stdout || 'Unknown error')

				return {
					type: 'result',
					data: { status: 'failed', reason: 'step_error', error: response.stderr },
				}
			}
		}

		const duration = Math.floor((Date.now() - start) / 1000)
		const usageCsv = history
			.map((h) => `${h.step.command},${h.success ? 'Success' : 'Fail'},${h.duration}ms`)
			.join('\n')
		await db.saveDocument('usage.csv', usageCsv)

		yield {
			type: 'log',
			level: 'success',
			message: t(WorkflowModel.UI.finished, { $seconds: String(duration) }),
		}
		return { type: 'result', data: { status: 'ok', duration } }
	}
}
