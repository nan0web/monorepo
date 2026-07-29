import { ModelAsApp } from '@nan0web/ui-cli'
import { show, ask, result } from '@nan0web/ui'
import DBFS from '@nan0web/db-fs'

import { ChatSessionModel } from './ChatSessionModel.js'
import { WorkflowModel } from '../WorkflowModel.js'
import { PipelineModel } from '../PipelineModel.js'
import { InitProjectModel } from './InitProjectModel.js'
import { WebShopperModel } from './WebShopperModel.js'
import { SubagentModel } from './SubagentModel.js'
import { TranslateDocsModel } from './TranslateDocsModel.js'
import { PackModel } from '../PackModel.js'
import { UnpackModel } from '../UnpackModel.js'
import { SystemModel } from '../SystemModel.js'
import { ModelsModel } from '../ModelsModel.js'
import { AiStrategyModel, StrategyEditModel, StrategyListModel, StrategyAddModel, StrategyRemoveModel, StrategyMoveModel } from '../AiStrategyModel.js'

import { PipelineCommand } from '../../Chat/commands/pipeline.js'
import { StrategyCommand } from '../../Chat/commands/strategy.js'

/**
 * Base Model wrapper for individual pipeline steps.
 */
class PipelineStepModel extends ModelAsApp {
	static intent = {
		help: 'App description or task for this step (positional)',
		default: '',
		positional: true,
	}
	static task = { help: 'Path to task.md with []() file references to resolve', default: '' }
	static model = { help: 'Model name or ID to use (e.g. llama3.1-8b, gpt-oss-120b)', default: '' }

	/**
	 * @param {Record<string, any>} [data]
	 * @param {Record<string, any>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {string} */ this.step = data.step || 'seed'
		/** @type {string} */ this.intent = data.intent || ''
		/** @type {string} */ this.task = data.task || ''
		/** @type {string} */ this.model = data.model || ''
	}

	async *run() {
		const cmd = new PipelineCommand({
			step: this.step,
			intent: this.intent,
			task: this.task,
			model: this.model,
		}, this._)
		for await (const val of cmd.run()) {
			if (val === false) continue
			yield val
		}
		return result({ status: 'ok' })
	}
}

class PipelineSeedCommand extends PipelineStepModel {
	static alias = 'pipeline:seed'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'seed' }, options)
	}
}

class PipelineModelCommand extends PipelineStepModel {
	static alias = 'pipeline:model'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'model' }, options)
	}
}

class PipelineContractCommand extends PipelineStepModel {
	static alias = 'pipeline:contract'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'contract' }, options)
	}
}

class PipelineAdapterCommand extends PipelineStepModel {
	static alias = 'pipeline:adapter'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'adapter' }, options)
	}
}

class PipelineCliCommand extends PipelineStepModel {
	static alias = 'pipeline:cli'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'cli' }, options)
	}
}

class PipelineChatCommand extends PipelineStepModel {
	static alias = 'pipeline:chat'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'chat' }, options)
	}
}

class PipelineWebCommand extends PipelineStepModel {
	static alias = 'pipeline:web'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'web' }, options)
	}
}

class PipelineMobileCommand extends PipelineStepModel {
	static alias = 'pipeline:mobile'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'mobile' }, options)
	}
}

class PipelineQaCommand extends PipelineStepModel {
	static alias = 'pipeline:qa'
	constructor(data = {}, options = {}) {
		super({ ...data, step: 'qa' }, options)
	}
}

/**
 * LlimoApp — main domain model as app for LLiMo.
 */
export class LlimoApp extends ModelAsApp {
	static alias = 'llimo'
	static UI = {
		title: 'LLiMo: Language Living Models',
	}

	static command = {
		help: 'Command to execute',
		options: [
			ChatSessionModel,
			WorkflowModel,
			PipelineModel,
			InitProjectModel,
			WebShopperModel,
			SubagentModel,
			TranslateDocsModel,
			PackModel,
			UnpackModel,
			SystemModel,
			ModelsModel,
			StrategyCommand,
			StrategyEditModel,
			StrategyListModel,
			StrategyAddModel,
			StrategyRemoveModel,
			StrategyMoveModel,
			PipelineSeedCommand,
			PipelineModelCommand,
			PipelineContractCommand,
			PipelineAdapterCommand,
			PipelineCliCommand,
			PipelineChatCommand,
			PipelineWebCommand,
			PipelineMobileCommand,
			PipelineQaCommand,
		],
		positional: true,
		default: ChatSessionModel,
	}

	/**
	 * @param {Partial<LlimoApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {ModelAsApp} */ this.command

		if (this._.db && !this._.db.mounts.has("@chat")) {
			try {
				this._.db.mount("@chat", new DBFS({ cwd: "chat" }))
			} catch (e) {
				// Ignore if sealed
			}
		}
	}

	async *run() {
		if (this.help || !this.command || typeof this.command.run !== 'function') {
			return yield* super.run()
		}
		return yield* this.command.run()
	}
}
