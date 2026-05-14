import { Model } from '@nan0web/types'
import { runCommand } from '../cli/runCommand.js'

/**
 * @property {'none'|'docker'|'orb'|'linux'} sandbox Sandbox Engine (none|docker|orb|linux)
 * @property {string} dockerImage Docker Image (auto-resolved if empty)
 * @property {string} machine OrbStack Linux Machine Name (for linux/orb sandbox)
 */
export class SandboxModel extends Model {
	/**
	 * @param {Partial<SandboxModel> | Record<string, any>} [data]
	 * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
	 */
	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {any} Sandbox Engine (none|docker|orb|linux) */ this.sandbox
		/** @type {any} Docker Image (auto-resolved if empty) */ this.dockerImage
		/** @type {any} OrbStack Linux Machine Name (for linux/orb sandbox) */ this.machine
	}




	static sandbox = {
		help: 'Sandbox Engine (none|docker|orb|linux)',
		default: 'none',
		options: ['none', 'docker', 'orb', 'linux'],
		env: 'LLIMO_SANDBOX',
	}
	static dockerImage = {
		help: 'Docker Image (auto-resolved if empty)',
		alias: 'docker',
		default: '',
		env: 'LLIMO_DOCKER_IMAGE',
	}
	static machine = {
		help: 'OrbStack Linux Machine Name (for linux/orb sandbox)',
		default: 'alpine',
	}

	/**
	 * Executes a command within the requested sandbox environment.
	 * @param {string} cmd
	 * @param {string[]} args
	 * @param {object} options Options passed to runCommand (e.g. onData callback)
	 */
	async exec(cmd, args = [], options = {}) {
		let runCmd = cmd
		let runArgs = [...args]

		if (this.sandbox === 'docker') {
			// Auto-resolve image if not explicitly set
			const isPython =
				runCmd === 'python' ||
				runCmd === 'python3' ||
				runCmd === 'pip' ||
				(runArgs.length > 0 && runArgs.some((a) => String(a).endsWith('.py')))
			const image = this.dockerImage || (isPython ? 'python:3.12-slim' : 'node:22-alpine')
			runArgs = [
				'run',
				'--rm',
				'-v',
				`${process.cwd()}:/workspace`,
				'-w',
				'/workspace',
				image,
				runCmd,
				...runArgs,
			]
			runCmd = 'docker'
		} else if (this.sandbox === 'orb' || this.sandbox === 'linux') {
			// Native Mac Virtualization via OrbStack
			runArgs = ['-m', this.machine, runCmd, ...runArgs]
			runCmd = 'orb'
		}

		return await runCommand(runCmd, runArgs, options)
	}
}
