// CLI Entry Point
import { ModelAsApp } from '@nan0web/ui-cli'
import { DownloadWhisperCommand } from './domain/commands/DownloadWhisperCommand.js'
import { VideoCompileCommand } from './domain/commands/VideoCompileCommand.js'
import { ShortsGenerateCommand } from './domain/commands/ShortsGenerateCommand.js'
import { SubtitleGenerateCommand } from './domain/commands/SubtitleGenerateCommand.js'
import { ScriptGenerateCommand } from './domain/commands/ScriptGenerateCommand.js'
import { PublishCommand } from './domain/commands/PublishCommand.js'

export class ShareAppCLI extends ModelAsApp {
	static alias = 'share'

	static command = {
		help: 'Commands for managing social media content distribution.',
		options: [
			DownloadWhisperCommand,
			VideoCompileCommand,
			ShortsGenerateCommand,
			SubtitleGenerateCommand,
			ScriptGenerateCommand,
			PublishCommand,
		],
		positional: true,
	}

	async *run() {
		yield* super.run()
	}
}

// Export the CLI entry point


