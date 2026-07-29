export class App extends AiModelAsApp {
    static command: {
        help: string;
        positional: boolean;
        options: (typeof ChatCommand)[];
        default: typeof ChatCommand;
    };
}
import { AiModelAsApp } from './app/AiModelAsApp.js';
/**
 * Chat with LLiMo.
 * Basic chat interface.
 * Possible to use LLiMo communication language.
 * Possible to use a specific strategy that defines sequence of models to use depending on parameters.
 * Possible to load custom system or agent prompts with included workflows/agents to defined chat behavior.
 *
 * ## Language
 * - Basic languages available in data/_/langs.nan0 with following workflows data/{lang}/workflows/{workflow}.md
 *
 * ## Strategy
 * - List of models to use with:
 *   - input data of the messages token length to understand if model can handle the input,
 *   - required tools if model support tools.
 * - Budget limit for the total execution
 * - Timeout limit for each model call
 * - Failover limit for the number of fallovers
 * - Retry count for immediate transient error retries
 * - Fallback codes for error codes/triggers that trigger fallback
 * - Tests pass retry count (development mode only)
 * ? Concurrency limit for parallel subagents
 * ? Caching mode for cache resolution strategy
 *
 * ## Prompts
 * - Basic system prompt that defines core model behaviour and format of the response (boundary by default).
 * - Agent prompts that define specific agent behaviour loaded from the cwd and cwd/.agent/.
 * - User prompt loaded from the markdown file or cli argument.
 *
 * ### Markdown prompt
 * - File injects with the standard markdown link `[filename](path/to/filename)`
 *
 * ### Packing the prompts
 * - System and agent prompts are packed into the single system message if model accepts or user message if not
 * - User prompt and attachments/injected files are packed into the single user LLiMo-communication message that appends the previous chat messages and chat model response history
 *
 * ## Tools
 * - Basic tools: list files, create files, update files, delete files (with clear acceptance from the user), move files, read files, execute scripts (with clear acceptance from the user)
 * - Extra tools defined in the workflow md files
 *
 * ### Platform tools
 * - Setup platform such as @nan0web/monorepo or its store that defines packages and apps that can share their workflows and inspectors from package.json#exports.llimo = { workflows: Record<string, string>, inspectors: Rectord<string, InspectorModel>, tools: Rectord<string, ToolModel> }
 *
 * ## Chat mode
 * - Simple chat: all files in response saved in cwd directory or remote db (abstract nan0web/db)
 * - Development mode: files created or overwritten in cwd, tests executed, auto-fix loop until all tests pass (with tests pass retry count)
 *
 * ## QA / Acceptance criteria
 * - All tests passed when development mode is enabled
 */
declare class ChatCommand extends AiModelAsApp {
    static alias: string;
}
export {};
