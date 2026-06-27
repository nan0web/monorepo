/**
 * Simple diff patch applicator.
 * @param {string} original
 * @param {string} patchText
 * @returns {string}
 */
export function applyPatch(original: string, patchText: string): string;
/**
 * @typedef {Object} Attachment
 * @property {string} filename
 * @property {string} content
 * @property {number | undefined} [startLine]
 * @property {number | undefined} [lineCount]
 */
/**
 * ChatSessionModel for llimo.v3
 */
export class ChatSessionModel extends AiModelAsApp {
    static alias: string;
    static commands: (typeof GetCommand)[];
    static UI: {
        welcome: string;
        errorNoAi: string;
        errorNoDb: string;
        errorNoChatDb: string;
        errorSavingMeta: string;
        confirm_execute_command: string;
        confirm_save_files: string;
        files_to_save: string;
        no_strategic_cascade: string;
        continue_loading: string;
        continue_replay: string;
        continue_healing: string;
        continue_resend: string;
        continue_no_session: string;
        trying_model: string;
        model_failed: string;
        file_changes_discarded: string;
        saved_file: string;
        loading_workflow: string;
        workflow_loaded: string;
        workflow_not_found: string;
        executing_command: string;
        command_succeeded: string;
        command_failed: string;
        skipped_command: string;
        executing_test_suite: string;
        tests_passed: string;
        tests_failed: string;
        running_linter: string;
        lint_passed: string;
        lint_failed: string;
        running_validator: string;
        validator_passed: string;
        validator_failed: string;
        streaming: string;
        streaming_finished: string;
        injected_files_summary: string;
        session_logs_saved: string;
        prompt_details: string;
        metrics_summary: string;
        skipping_model_context_overflow: string;
        run_tests_option: string;
        run_lint_option: string;
        run_validate_option: string;
        continue_session_option: string;
        verification_help: string;
        auto_verify_running: string;
        auto_verify_passed: string;
        auto_verify_failed: string;
        auto_verify_exhausted: string;
        auto_verify_progress: string;
        auto_verify_prompt: string;
        llmErrorFormatValidation: string;
    };
    static id: {
        help: string;
        default: null;
        type: string;
    };
    static date: {
        help: string;
        default: null;
        type: DateConstructor;
    };
    static input: {
        help: string;
        default: string;
        type: string;
        positional: boolean;
    };
    static model: {
        help: string;
        default: string;
    };
    static logsPath: {
        help: string;
        default: string;
    };
    static status: {
        help: string;
        default: string;
    };
    static communication: {
        help: string;
        default: string;
    };
    static workflow: {
        help: string;
        alias: string;
        multiple: boolean;
        type: string;
        default: () => never[];
    };
    static autoVerify: {
        help: string;
        alias: string;
        type: string;
        default: boolean;
    };
    static maxRetries: {
        help: string;
        type: string;
        default: number;
    };
    static continue: {
        help: string;
        alias: string;
        type: string;
        default: boolean;
    };
    /**
     * Simple diff patch applicator.
     * Supports basic unified diff format or custom +/- line changes.
     * @param {string} original
     * @param {string} patchText
     * @returns {string}
     */
    static applyPatch(original: string, patchText: string): string;
    /**
     * @param {Partial<ChatSessionModel> | Record<string, any>} [data]
     * @param {Partial<import('./AiModelAsApp.js').AiModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ChatSessionModel> | Record<string, any>, options?: Partial<import("./AiModelAsApp.js").AiModelAsAppOptions>);
    /** @type {string} Chat session identifier */ id: string;
    /** @type {Date} Created chat date */ date: Date;
    /** @type {string} Initial input prompt or path to file */ input: string;
    /** @type {string} AI model override for the session */ model: string;
    /** @type {string} Absolute path to the directory hosting the chat artifacts */ logsPath: string;
    /** @type {'active' | 'ok' | 'failed'} Current status of the execution */ status: "active" | "ok" | "failed";
    /** @type {'boundary' | 'markdown'} Communication format: boundary */ communication: "boundary" | "markdown";
    /** @type {string | string[]} Specific workflows to load */ workflow: string | string[];
    /** @type {boolean} Automatically run tests after file save */ autoVerify: boolean;
    /** @type {number} Maximum number of auto-verify retry cycles */ maxRetries: number;
    /** @type {boolean} Continue from previous session */ continue: boolean;
    /** @type {string[]} List of positional file paths */ _positionals: string[];
    /** @type {Map<string, number>} Map of injected files and sizes */ injectedFiles: Map<string, number>;
    /** @type {Map<string, typeof Command>} Map of command handlers */ commandsRegistry: Map<string, typeof Command>;
    /**
     * Build the system prompt from data/{locale}/system.md.
     * Injects the list of available workflow files into <!--WORKFLOWS_INDEX-->.
     * @param {string} [locale='uk']
     * @returns {Promise<string>}
     */
    buildSystemPrompt(locale?: string): Promise<string>;
    /**
     * Load a workflow by name from data/{locale}/workflows/{name}.
     * @param {string} name Workflow filename (e.g. 'nan0web.md')
     * @param {string} [locale='uk']
     * @returns {Promise<string>}
     */
    loadWorkflow(name: string, locale?: string): Promise<string>;
    /**
     * Scans the local nan0web platform to locate all workflows and inspectors.
     * Returns a map of: name -> absolutePath
     * @returns {Promise<{ workflows: Record<string, string>, inspectors: Record<string, string> }>}
     */
    getPlatformRegistry(): Promise<{
        workflows: Record<string, string>;
        inspectors: Record<string, string>;
    }>;
    _platformRegistry: {
        workflows: {};
        inspectors: {};
    } | undefined;
    /**
     * Execute an agent-driven context command.
     * @param {string} commandName E.g. '@ls', '@get', '@search'
     * @param {string} content Command input text
     * @returns {Promise<string>} Command output/result
     */
    executeAgentCommand(commandName: string, content: string): Promise<string>;
    /**
     * Format command output as a single summary line.
     * @param {string} stdoutText
     * @returns {string}
     */
    formatOneLineSummary(stdoutText: string): string;
    /**
     * Expand a path or glob pattern into an array of file paths.
     * Also supports logical database paths like @data/ or @workflows/.
     * @param {string} relativePath
     * @returns {Promise<Array<{path: string, isDb: boolean}>>}
     */
    resolvePaths(relativePath: string): Promise<Array<{
        path: string;
        isDb: boolean;
    }>>;
    /**
     * Resolve user input, loading referenced files and positional arguments.
     * @param {string} input
     * @returns {Promise<string>}
     */
    packInput(input: string): Promise<string>;
    /**
     * Main execution loop for the Chat session
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
    _currentDb: any;
    /**
     * @param {{ files: Attachment[] }} parsed
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, boolean | number | string[], any>}
     */
    processFileChanges(parsed: {
        files: Attachment[];
    }): AsyncGenerator<import("@nan0web/ui").Intent, boolean | number | string[], any>;
    /**
     * Process agent commands, workflows, and bash blocks from parsed response.
     * @param {import('../../utils/StrictBoundaryInterpreter.js').ParseResult} parsed
     * @param {string[]} modifiedFiles
     * @param {{ extraSystemMessages: Array<{role: string, content: string}>, agentIterations: number, singleShot: boolean }} ctx
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, boolean | import('@nan0web/ui').ResultIntent, any>}
     */
    processRequests(parsed: import("../../utils/StrictBoundaryInterpreter.js").ParseResult, modifiedFiles: string[], ctx: {
        extraSystemMessages: Array<{
            role: string;
            content: string;
        }>;
        agentIterations: number;
        singleShot: boolean;
    }): AsyncGenerator<import("@nan0web/ui").Intent, boolean | import("@nan0web/ui").ResultIntent, any>;
    /**
     * Run the shortest path test suite sequentially.
     * @param {string[]} modifiedFiles
     * @returns {Promise<{ success: boolean, output: string, failCount: number }>}
     */
    runShortestPathTests(modifiedFiles: string[]): Promise<{
        success: boolean;
        output: string;
        failCount: number;
    }>;
    /**
     * Get corresponding test files for a list of modified files.
     * @param {string[]} files
     * @returns {Promise<string[]>}
     */
    getCorrespondingTestFiles(files: string[]): Promise<string[]>;
    /**
     * Detect the test runner for JS project.
     * @returns {Promise<string>} 'vitest', 'jest', or 'node'
     */
    detectTestRunner(): Promise<string>;
    /**
     * Run a specific test file using the appropriate runner.
     * @param {string} runner
     * @param {string} file
     * @returns {Promise<any>}
     */
    runTestFile(runner: string, file: string): Promise<any>;
    /**
     * Count test failures from output.
     * @param {string} output
     * @returns {number}
     */
    countFailures(output: string): number;
    /**
     * Extract errors from test runner output.
     * @param {string} output
     * @returns {string}
     */
    extractErrors(output: string): string;
    /**
     * Check if a line is part of a stack trace or error.
     * @param {string} line
     * @returns {boolean}
     */
    isStackTraceOrErrorLine(line: string): boolean;
    /**
     * Load conversation history from a session's messages.jsonl.
     * @param {any} sessionDb DBFS instance for the session directory
     * @returns {Promise<Array<{role: string, content: string}>>}
     */
    loadSessionHistory(sessionDb: any): Promise<Array<{
        role: string;
        content: string;
    }>>;
    /**
     * Log a trace event to session_trace.jsonl.
     * @param {any} event
     * @returns {Promise<void>}
     */
    logTrace(event: any): Promise<void>;
}
/**
 * VerificationActionModel representing verification actions (test, lint, validate).
 */
export class VerificationActionModel extends ModelAsApp {
    /**
     * @param {Record<string, any>} data
     * @param {any} options
     */
    constructor(data?: Record<string, any>, options?: any);
    key: any;
    cmd: any;
    labelKey: any;
    runningKey: any;
    passedKey: any;
    failedKey: any;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
    /**
     * Formats a multi-line test runner output into a single line summary.
     * @param {string} text
     * @returns {string}
     */
    formatOneLineSummary(text: string): string;
}
export type Attachment = {
    filename: string;
    content: string;
    startLine?: number | undefined;
    lineCount?: number | undefined;
};
import { AiModelAsApp } from './AiModelAsApp.js';
import { Command } from './commands/index.js';
import { GetCommand } from './commands/index.js';
import { ModelAsApp } from '@nan0web/ui';
