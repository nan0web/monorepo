import { ModelAsApp } from '../ModelAsApp.js'
import { resolvePositionalArgs } from '@nan0web/ui-cli'
import SnapshotAuditor from './SnapshotAuditor.js'
import GalleryCommand from './GalleryCommand.js'
import ConfigApp from './ConfigApp.js'
import { show, result } from '../../core/Intent.js'

/**
 * @property {string[]} _positionals
 * @property {string} command Type of command to run
 * @property {boolean} help Show help message
 */
export class UIApp extends ModelAsApp {
	static command = {
		type: 'string',
		help: 'Command to run (e.g. gallery)',
		options: [GalleryCommand, SnapshotAuditor, ConfigApp],
		default: GalleryCommand.alias || GalleryCommand.name,
		positional: true,
	}

	static UI = {
		helpText: [
			'# ✨ NaN•Web UI CLI',
			'',
			'Zero-Hallucination Tools for the NaN•Web ecosystem.',
			'',
			'## Usage',
			'',
			'```bash',
			'',
			'nan0ui gallery audit',
			'',
			'nan0ui gallery render',
			'',
			'```',
		].join('\n'),
		unknownCommand: 'Unknown command: {command}',
	}

	static help = {
		help: 'Show help message',
		default: false,
	}

	/**
	 * @param {Partial<UIApp> | Record<string, any>} [data={}]
	 * @param {Partial<import('@nan0web/types').ModelOptions>} [options={}]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
	}

	async *run() {
		const t = this._.t
		const cmd = /** @type {any} */ (this).command
		const help = /** @type {any} */ (this).help

		if (help) return yield* super.run()

		if (!cmd || !(cmd instanceof ModelAsApp)) {
			yield show(t(UIApp.UI.unknownCommand, { command: cmd }), 'error')
			return result({ status: 'error' })
		}

		return yield* cmd.run()
	}
}

export default UIApp
