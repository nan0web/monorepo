import { Model } from '@nan0web/types'
import { packMarkdown } from '../llm/pack.js'
import { resolve } from 'node:path'

/**
 * Packs files into a single markdown string based on a checklist.
 */
export class PackModel extends Model {
	static input = {
		help: 'Input markdown file with checklist (or stdin if empty)',
		type: 'string',
		positional: true
	}

	static output = {
		help: 'Output file path',
		type: 'string',
		positional: true
	}

	static UI = {
		started: 'Packing files started',
		saved: 'Saved to {$file} ({$size} b)',
		failed: 'Packing failed: {$error}',
		noInput: 'No input file provided',
		warning: 'Failed to read files:\n{$errors}',
		info: 'Injected files: {$count}\n{$injected}'
	}

	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {string} Input markdown file with checklist */ this.input
		/** @type {string} Output packed markdown */ this.output
	}

	async *run() {
		const { t = (/** @type {any} */ v) => v } = /** @type {any} */ (this._)
		try {
			yield { type: 'progress', message: t(PackModel.UI.started) }
			
			const fs = await import('node:fs/promises')
			let inputText = ''
			
			if (this.input) {
				inputText = await fs.readFile(resolve(this.input), 'utf-8')
			} else if (!process.stdin.isTTY) {
                for await (const chunk of process.stdin) {
                    inputText += chunk
                }
            } else {
                yield { type: 'log', level: 'error', message: t(PackModel.UI.noInput) }
                return { status: 'failed', reason: 'no_input' }
            }

			const { text, injected, errors } = await packMarkdown({ input: inputText })
			
			if (errors.length > 0) {
			    yield { type: 'log', level: 'warning', message: t(PackModel.UI.warning, { $errors: errors.join('\n') }) }
			}

			if (this.output) {
				await fs.writeFile(resolve(this.output), text)
				const stats = await fs.stat(resolve(this.output))
				yield { type: 'log', level: 'success', message: t(PackModel.UI.saved, { $file: this.output, $size: stats.size }) }
				if (injected.length > 0) {
				    yield { type: 'log', level: 'info', message: t(PackModel.UI.info, { $count: injected.length, $injected: injected.join('\n') }) }
				}
			} else {
			    // When piping output directly
				console.info(text)
			}

			return { status: 'ok', size: text.length }
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error)
			yield { type: 'log', level: 'error', message: t(PackModel.UI.failed, { $error: msg }) }
			return { status: 'failed', error: msg }
		}
	}
}
