import { ModelAsApp, result } from '@nan0web/ui'
import DBFS from '@nan0web/db-fs'

import { ChatSessionModel } from './ChatSessionModel.js'
import { StrategyApp } from '../strategy/AiStrategyModel.js'
import { StatsReportModel } from '../stats/StatsReportModel.js'
import { WorkflowApp } from '../workflow/WorkflowApp.js'
import { PipelineApp } from '../pipeline/PipelineApp.js'

/**
 * LlimoApp — main domain model as app for llimo.v3
 */
export class LlimoApp extends ModelAsApp {
	static alias = 'llimo.v3'
	static UI = {
		title: 'llimo.v3: Advanced OLMUI LLM Agent',
	}

	static command = {
		help: 'Command to execute',
		options: [
			ChatSessionModel,
			StrategyApp,
			StatsReportModel,
			WorkflowApp,
			PipelineApp,
		],
		positional: true,
		default: ChatSessionModel,
	}

	/**
	 * @param {Partial<LlimoApp>} [data]
	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
	 */
	constructor(data = {}, options = {}) {
		const cleanData = /** @type {any} */ ({ ...data })

		if (typeof cleanData.command === 'string' && cleanData.command !== '') {
			const parts = cleanData.command.trim().split(/\s+/)
			const firstWord = parts[0]
			const knownAliases = (LlimoApp.command.options || []).map(o => o.alias).filter(Boolean)

			if (knownAliases.includes(firstWord)) {
				cleanData.command = firstWord
				const extraPos = parts.slice(1)
				cleanData._positionals = [...extraPos, ...(cleanData._positionals || [])]
			}
		}

		super(cleanData, options)
		/** @type {any} */ this.command

		if (typeof this.command === 'string' && this.command !== '') {
			const chatData = {
				...cleanData,
				input: this.command,
				_positionals: cleanData._positionals || []
			}
			this.command = new ChatSessionModel(chatData, { ...options, parentPath: this._.parentPath })
		} else if (!this.command) {
			this.command = new ChatSessionModel(cleanData, { ...options, parentPath: this._.parentPath })
		}

		if (this._.db && !this._.db.mounts.has("@chat")) {
			try {
				this._.db.mount("@chat", new DBFS({ cwd: "chat" }))
			} catch (e) {
				// Ignore if already mounted or sealed
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
