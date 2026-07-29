import { Model } from '@nan0web/types'
import { FileProtocol } from '../FileProtocol.js'
import { unpackAnswer } from '../llm/unpack.js'
import { resolve } from 'node:path'

export class UnpackModel extends Model {
	static alias = 'unpack'
	static input = {
		help: 'Input markdown file (or stdin if empty)',
		type: 'string',
		positional: true,
	}

	static output = {
		help: 'Output directory (deprecated, defaults to cwd)',
		type: 'string',
		positional: true,
	}

	static dry = {
		help: 'Dry run, without saving files',
		type: 'boolean',
		default: false,
	}

	static UI = {
		started: 'Unpacking markdown started',
		failed: 'Unpacking failed: {$error}',
		noInput: 'No input provided for unpacking',
	}

	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {string} Input markdown file */ this.input
		/** @type {string} Output directory */ this.output
		/** @type {boolean} Dry run without saving files */ this.dry
	}

	async *run() {
		const { t = (/** @type {any} */ v) => v } = /** @type {any} */ (this._)
		try {
			yield { type: 'progress', message: t(UnpackModel.UI.started) }

			let content = ''

			if (this.input) {
				const fs = await import('node:fs/promises')
				content = await fs.readFile(resolve(this.input), 'utf-8')
			} else if (!process.stdin.isTTY) {
				let stdinData = ''
				for await (const chunk of process.stdin) {
					stdinData += chunk
				}
				content = stdinData
			} else {
				yield { type: 'log', level: 'error', message: t(UnpackModel.UI.noInput) }
				return { status: 'failed', reason: 'no_input' }
			}

			const parsed = await FileProtocol.parseAdaptive(content)
			const stream = unpackAnswer(parsed, this.dry, process.cwd())

			for await (const str of stream) {
				// unpackAnswer outputs ANSI-formatted stdout
				console.info(str)
			}

			return { status: 'ok' }
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error)
			yield { type: 'log', level: 'error', message: t(UnpackModel.UI.failed, { $error: msg }) }
			return { status: 'failed', error: msg }
		}
	}
}
