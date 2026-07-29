import { ModelAsApp, show, result } from '@nan0web/ui-cli'
import { PipelineCommand } from '../Chat/commands/pipeline.js'

export class PipelineModel extends ModelAsApp {
	static alias = 'pipeline'
	static intent = { help: 'Intent description', positional: true }
	static dir = { help: 'Target directory', positional: true, default: '.' }
	static appName = { help: 'Explicit app name', default: '' }
	static quiet = { default: false, type: 'boolean' }
	static from = { default: 'seed' }
	static task = { help: 'Path to task.md with []() file references to resolve', default: '' }
	static model = { help: 'Model name or ID to use', default: '' }

	constructor(data = {}) {
		super()
		this.intent = data.intent ?? ''
		this.dir = data.dir ?? '.'
		this.appName = data.appName ?? ''
		this.quiet = data.quiet ?? false
		this.from = data.from ?? 'seed'
		this.task = data.task ?? ''
		this.model = data.model ?? ''
	}

	inferName() {
		if (this.appName) return this.appName
		if (!this.intent) return 'App'
		const words = this.intent.trim().split(/\s+/)
		const last = words[words.length - 1]
		return last || 'App'
	}

	// @ts-ignore
	async *run() {
		if (!this.intent) {
			yield show('Missing intent', 'error')
			return result({ status: 'failed' })
		}

		const steps = ['seed', 'model', 'contract', 'adapter', 'cli', 'chat', 'web', 'mobile', 'qa']
		const startIdx = steps.indexOf(this.from) !== -1 ? steps.indexOf(this.from) : 0

		for (let i = startIdx; i < steps.length; i++) {
			const step = steps[i]

			const cmd = new PipelineCommand({
				step,
				intent: this.intent,
				task: this.task,
				model: this.model,
			}, this._)

			let hasError = false
			for await (const val of cmd.run()) {
				if (val === false) continue
				yield val
				if (val && val.type === 'result' && val.data?.status === 'failed') {
					hasError = true
				}
			}

			if (hasError) {
				return result({ status: 'failed', step })
			}
		}

		return result({ status: 'ok' })
	}
}
