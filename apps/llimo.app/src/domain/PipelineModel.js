import { ModelAsApp, show, result } from '@nan0web/ui-cli'

export class PipelineModel extends ModelAsApp {
	static intent = { help: 'Intent description', positional: true }
	static dir = { help: 'Target directory', positional: true, default: '.' }
	static appName = { help: 'Explicit app name', default: '' }
	static quiet = { default: false, type: 'boolean' }
	static from = { default: 'seed' }

	constructor(data = {}) {
		super()
		this.intent = data.intent ?? ''
		this.dir = data.dir ?? '.'
		this.appName = data.appName ?? ''
		this.quiet = data.quiet ?? false
		this.from = data.from ?? 'seed'
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
	}
}
