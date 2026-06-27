import { ModelAsApp, show, result, render } from '@nan0web/ui'
import { PipelineRunner } from './PipelineRunner.js'

/**
 * PipelineListModel — lists all registered pipelines.
 */
export class PipelineListModel extends ModelAsApp {
	static alias = 'list'

	static UI = {
		title: '📋 Available Pipelines',
		empty: 'No pipelines registered.',
	}

	async *run() {
		const { t } = this._
		const pipelines = [
			{ name: 'app', desc: '9-phase OLMUI development pipeline (Seed -> Model -> Contract -> UI -> QA).' },
			{ name: 'logic', desc: 'Processes text filtering through the 4 Laws of Logic.' }
		]

		yield render('Alert', {
			title: t(PipelineListModel.UI.title),
			message: pipelines.map(p => `- ${p.name}: ${p.desc}`).join('\n'),
			variant: 'success'
		})

		return result({ ok: true, pipelines })
	}
}

/**
 * PipelineRunModel — runs a specific pipeline.
 */
export class PipelineRunModel extends ModelAsApp {
	static alias = 'run'

	static UI = {
		title: '🚀 Running Pipeline: {name}',
		errorNoName: 'Pipeline name is required.',
		errorNotFound: 'Pipeline {name} not found.',
	}

	static name = {
		help: 'Pipeline name (e.g. app, logic)',
		default: '',
		positional: true,
	}

	static task = {
		help: 'Task description or input text for the pipeline',
		default: '',
		positional: true,
	}

	static autoVerify = {
		help: 'Enable automatic testing/verification loop',
		type: 'boolean',
		default: false,
	}

	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.name
		/** @type {string} */ this.task
		/** @type {boolean} */ this.autoVerify
		/** @type {string[]} */ this._positionals = data._positionals || []
	}

	async *run() {
		const { t } = this._

		if (!this.name) {
			yield show(t(PipelineRunModel.UI.errorNoName), 'error')
			return result({ ok: false })
		}

		yield show(t(PipelineRunModel.UI.title, { name: this.name }), 'info')

		const runner = new PipelineRunner(this._)
		const res = yield* runner.execute(this.name, this.task, {
			autoVerify: this.autoVerify,
			positionals: this._positionals || []
		})
		return result(res)
	}
}

/**
 * PipelineApp — container command for running AI pipelines.
 */
export class PipelineApp extends ModelAsApp {
	static alias = 'pipeline'

	static UI = {
		title: '⛓️ LLiMo Pipelines',
		description: 'Run multi-stage LLM agent pipelines.',
	}

	static command = {
		help: 'Pipeline subcommand (list, run)',
		options: [PipelineListModel, PipelineRunModel],
		default: PipelineListModel,
		positional: true,
	}

	constructor(data = {}, options = {}) {
		const cleanData = /** @type {any} */ ({ ...data })

		if (typeof cleanData.command === 'string' && cleanData.command !== '') {
			const parts = cleanData.command.trim().split(/\s+/)
			const firstWord = parts[0]
			const knownAliases = (PipelineApp.command.options || []).map(o => o.alias).filter(Boolean)

			if (knownAliases.includes(firstWord)) {
				cleanData.command = firstWord
				const extraPos = parts.slice(1)
				cleanData._positionals = [...extraPos, ...(cleanData._positionals || [])]
			}
		}

		super(cleanData, options)
		/** @type {any} */ this.command
	}
}
