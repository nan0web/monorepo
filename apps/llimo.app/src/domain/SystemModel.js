import { Model } from '@nan0web/types'
import { generateSystemPrompt } from '../llm/system.js'
import { resolve } from 'node:path'

export class SystemModel extends Model {
	static output = {
		help: 'Output file path',
		type: 'string',
		positional: true
	}

	static UI = {
		started: 'System prompt generation started',
		saved: 'Saved system prompt to {$file} ({$size} b)',
		failed: 'Generation failed: {$error}'
	}

	constructor(data = {}, options = /** @type {any} */ ({})) {
		super(data, options)
		/** @type {string} Output file path for system prompt */ this.output
	}

	async *run() {
		const { t = (/** @type {any} */ v) => v } = /** @type {any} */ (this._)
		try {
			yield { type: 'progress', message: t(SystemModel.UI.started) }
			
			const outputPath = this.output ? resolve(this.output) : undefined
			const fs = await import('node:fs/promises')
			
			const outputText = await generateSystemPrompt(outputPath)

			if (outputPath) {
				const stats = await fs.stat(outputPath)
				yield { type: 'log', level: 'success', message: t(SystemModel.UI.saved, { $file: outputPath, $size: stats.size }) }
			} else {
				console.info(outputText)
			}

			return { status: 'ok' }
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error)
			yield { type: 'log', level: 'error', message: t(SystemModel.UI.failed, { $error: msg }) }
			return { status: 'failed', error: msg }
		}
	}
}
