export class PipelineCommand extends UiCommand {
    static name: string;
    static description: string;
    static UI: {
        PACKAGE_JSON_NOT_FOUND: string;
        RUNNING_PNPM_INSTALL: string;
        PROJECT_INITIALIZED: string;
        PNPM_INSTALL_FAILED: string;
        MONOREPO_ROOT_NOT_FOUND: string;
        UNKNOWN_STEP: string;
        STEP_STARTED: string;
        FAILED_LOAD_BASE_PROMPT: string;
        WORKFLOW_LOADED: string;
        NO_WORKFLOWS_FOUND: string;
        SESSION_WORKFLOWS_LOADED: string;
        TASK_LOADED: string;
        FAILED_LOAD_TASK: string;
        NO_TASK_PROVIDED: string;
        CONTEXT_INFO: string;
        INITIALIZING_AI: string;
        AI_READY: string;
        MODEL_NOT_FOUND: string;
        AUTO_SELECTED_MODEL: string;
        USING_MODEL: string;
        SPECIFIED_MODEL: string;
        NO_MODELS_AVAILABLE: string;
        STEP_COMPLETE: string;
        EXTRACTING_FILES: string;
        EXECUTING_COMMAND: string;
        UNKNOWN_COMMAND: string;
        EXTRACTED_FILE: string;
        PARSE_ERROR: string;
        RUNNING_TESTS: string;
        TESTS_PASSED: string;
        TESTS_FAILED: string;
        NO_PACKAGE_JSON: string;
        FAILED: string;
        RESOLVED_REF: string;
        NOT_FOUND: string;
    };
    /**
     * @param {{ argv?: string[], chat?: import('../../llm/Chat.js').Chat }} [input]
     * @returns {PipelineCommand}
     */
    static create(input?: {
        argv?: string[];
        chat?: import("../../llm/Chat.js").Chat;
    }): PipelineCommand;
    /**
     * @param {Partial<PipelineCommand>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<PipelineCommand>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} */
    step: string;
    /** @type {string} */
    intent: string;
    /** @type {string} */
    task: string;
    /** @type {string} */
    model: string;
    /** @type {any} */
    db: any;
    /** @type {any} */
    fs: any;
    /** @type {any} */
    ai: any;
    /** @type {PipelineOptions} */
    options: PipelineOptions;
    _: any;
    t(key: any, params?: {}): any;
    /**
     * @param {string} path
     * @returns {Promise<boolean>}
     */
    _dbHas(path: string): Promise<boolean>;
    /**
     * @param {string} path
     * @param {any} [options]
     * @returns {Promise<any>}
     */
    _dbGet(path: string, options?: any): Promise<any>;
    /**
     * @param {string} path
     * @param {any} content
     * @returns {Promise<void>}
     */
    _dbSet(path: string, content: any): Promise<void>;
    /**
     * @param {string} path
     * @param {any} [options]
     * @returns {Promise<string[]>}
     */
    _dbBrowse(path: string, options?: any): Promise<string[]>;
    /**
     * @param {string} command
     * @param {any} [options]
     * @returns {any}
     */
    execSync(command: string, options?: any): any;
    /**
     * @param {string} command
     * @param {string[]} args
     * @param {any} [options]
     * @returns {any}
     */
    spawn(command: string, args: string[], options?: any): any;
    ensureProjectInitialized(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, void, unknown>;
    /**
     * Setup session workflows in the target database.
     * @param {string} step
     * @returns {Promise<number>}
     */
    setupSessionWorkflows(step: string): Promise<number>;
    run(): AsyncGenerator<any, void, any>;
    /**
     * Run tests and stream output line by line.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { output: string, exitCode: number }>}
     */
    _runTestsWithStreaming(): AsyncGenerator<import("@nan0web/ui").Intent, {
        output: string;
        exitCode: number;
    }>;
    #private;
}
export type PipelineStep = "seed" | "model" | "contract" | "adapter" | "cli" | "chat" | "web" | "mobile" | "qa";
import { UiCommand } from '../../cli/Ui.js';
declare class PipelineOptions {
    static step: {
        help: string;
        default: string;
        options: string[];
    };
    static intent: {
        help: string;
        default: string;
        positional: boolean;
    };
    static task: {
        help: string;
        default: string;
    };
    static model: {
        help: string;
        default: string;
    };
    constructor(input?: {});
    /** @type {string} */
    step: string;
    /** @type {string} */
    intent: string;
    /** @type {string} */
    task: string;
    /** @type {string} */
    model: string;
}
export {};
