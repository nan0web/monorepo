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
		],
		positional: true,
	}

	async *run() {
		yield* super.run()
	}
}
