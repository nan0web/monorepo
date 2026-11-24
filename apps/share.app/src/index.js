// CLI Entry Point & Root Domain Exports
import { ModelAsApp } from '@nan0web/ui-cli'
import { DownloadWhisperCommand } from './domain/commands/DownloadWhisperCommand.js'
import { VideoCompileCommand } from './domain/commands/VideoCompileCommand.js'
import { ShortsGenerateCommand } from './domain/commands/ShortsGenerateCommand.js'
import { SubtitleGenerateCommand } from './domain/commands/SubtitleGenerateCommand.js'
import { ScriptGenerateCommand } from './domain/commands/ScriptGenerateCommand.js'
import { PublishCommand } from './domain/commands/PublishCommand.js'
import { VideoPipelineCommand } from './domain/commands/VideoPipelineCommand.js'
import { DriveIndexCommand } from './domain/commands/DriveIndexCommand.js'
import { DeduplicateCommand } from './domain/commands/DeduplicateCommand.js'
import { DriveBatchTranscribeCommand } from './domain/commands/DriveBatchTranscribeCommand.js'
import { TranscribeCommand } from './domain/commands/TranscribeCommand.js'
import { WhisperModelsCommand } from './domain/commands/WhisperModelsCommand.js'
import { ExportCommand } from './domain/commands/ExportCommand.js'
import { MusicPrepareCommand } from './domain/commands/MusicPrepareCommand.js'
import { MarkdownAstExtractor } from './domain/services/MarkdownAstExtractor.js'
import { TagLinter } from './domain/services/TagLinter.js'
import { SemanticStreamRouter } from './domain/services/SemanticStreamRouter.js'
import { MediaDownloadModel } from './domain/MediaDownloadModel.js'
import { DummyAdapter } from './domain/DummyAdapter.js'
import { SocialAdapter } from './domain/SocialAdapter.js'
import { evaluateRules, executeTasks, parseDelay, matchesConditions } from './domain/RulesEngine.js'

export {
	MediaDownloadModel,
	DummyAdapter,
	SocialAdapter,
	evaluateRules,
	executeTasks,
	parseDelay,
	matchesConditions,
	DriveIndexCommand,
	DeduplicateCommand,
	DriveBatchTranscribeCommand,
	TranscribeCommand,
	WhisperModelsCommand,
	ExportCommand,
	MusicPrepareCommand,
	MarkdownAstExtractor,
	TagLinter,
	SemanticStreamRouter,
}
export * from './domain/Models.js'
export * from './domain/models/DriveModel.js'
export * from './ports/index.js'

export class ShareAppCLI extends ModelAsApp {
	static alias = 'share'

	static command = {
		help: 'Commands for managing social media content distribution and offline storage drives.',
		options: [
			DownloadWhisperCommand,
			VideoCompileCommand,
			ShortsGenerateCommand,
			SubtitleGenerateCommand,
			ScriptGenerateCommand,
			PublishCommand,
			VideoPipelineCommand,
			DriveIndexCommand,
			DeduplicateCommand,
			DriveBatchTranscribeCommand,
			TranscribeCommand,
			WhisperModelsCommand,
			ExportCommand,
			MusicPrepareCommand,
		],
		positional: true,
	}

	/**
	 * @param {Partial<ShareAppCLI>} [data]

	 * @param {Partial<import('@nan0web/ui').ModelAsAppOptions & { toolChecker?: typeof import('./ports/ToolCheckerPort.js').ToolCheckerPort }>} [options]
	 */
	constructor(data = {}, options = {}) {
		super(data, options)
		/** @type {typeof import('./ports/ToolCheckerPort.js').ToolCheckerPort | undefined} */
		this.toolChecker = options?.toolChecker
	}

	async *run() {
		yield* super.run()
	}
}

