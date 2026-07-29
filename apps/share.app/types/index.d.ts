export class ShareAppCLI extends ModelAsApp {
    static alias: string;
    static command: {
        help: string;
        options: (typeof DownloadWhisperCommand | typeof VideoCompileCommand | typeof ShortsGenerateCommand | typeof SubtitleGenerateCommand | typeof ScriptGenerateCommand | typeof PublishCommand)[];
        positional: boolean;
    };
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").Intent, void, any>;
}
import { ModelAsApp } from '@nan0web/ui-cli';
import { DownloadWhisperCommand } from './domain/commands/DownloadWhisperCommand.js';
import { VideoCompileCommand } from './domain/commands/VideoCompileCommand.js';
import { ShortsGenerateCommand } from './domain/commands/ShortsGenerateCommand.js';
import { SubtitleGenerateCommand } from './domain/commands/SubtitleGenerateCommand.js';
import { ScriptGenerateCommand } from './domain/commands/ScriptGenerateCommand.js';
import { PublishCommand } from './domain/commands/PublishCommand.js';
