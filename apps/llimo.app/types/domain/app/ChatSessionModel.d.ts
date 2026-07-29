/**
 * Contract for the injected AI Engine
 * @typedef {Object} AIEngineContract
 * @property {import('../../llm/ModelInfo.js').ModelInfo | null} selectedModel The currently selected AI model
 * @property {function(string): import('../../llm/ModelInfo.js').ModelInfo | undefined} getModel Get a model by ID
 * @property {function(string): import('../../llm/ModelInfo.js').ModelInfo | undefined} findModel Find a model by partial ID
 * @property {function(string, any[], any=): import('ai').StreamTextResult<any>} streamText Stream text from AI
 */
/**
 * Model-as-Schema for tracking metadata of an active LLiMo Engine execution or chat
 */
export class ChatSessionModel extends AiModelAsApp {
    static alias: string;
    static UI: {
        errorApi: string;
        errorNoAi: string;
        errorNoDb: string;
        errorModel: string;
        welcome: string;
        thinking: string;
        streaming: string;
        processing: string;
        packed: string;
        unpacked: string;
        tests: string;
        testOk: string;
        testFailed: string;
        moreLines: string;
        next: string;
        done: string;
    };
    static id: {
        help: string;
        default: null;
        type: string;
    };
    static date: {
        help: string;
        default: null;
        type: string;
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
        type: string;
    };
    static logsPath: {
        help: string;
        default: string;
        type: string;
    };
    static status: {
        help: string;
        default: string;
        type: string;
        error: string;
        validate: (val: any) => string | true;
    };
    static communication: {
        help: string;
        default: string;
        error: string;
        validate: (val: any) => string | true;
    };
    /**
     * Generate and inject the system prompt on first chat creation.
     * Loads the base template, local system.md/agent.md overrides, packs
     * referenced files, and persists the result as a system message.
     *
     * @param {import('@nan0web/ai').ChatSession} chat
     * @param {import('../../utils/FileSystem.js').FileSystem} fs
     * @param {string} cwd
     */
    static initSystemPrompt(chat: import("@nan0web/ai").ChatSession, fs: import("../../utils/FileSystem.js").FileSystem, cwd: string): Promise<void>;
    /**
     * Resolve user input into a packed prompt string.
     * If the input points to an existing file, reads it and packs
     * any referenced file links into the prompt context.
     *
     * @param {string} input
     * @param {import('@nan0web/db').DB} db
     * @returns {Promise<{ promptText: string, packedCount: number }>}
     */
    static packInput(input: string, db: import("@nan0web/db").DB): Promise<{
        promptText: string;
        packedCount: number;
    }>;
    /**
     * Find a model by its full or partial ID.
     *
     * @param {AIEngineContract} ai
     * @param {string} modelId
     * @returns {import('../../llm/ModelInfo.js').ModelInfo | undefined}
     */
    static resolveModel(ai: AIEngineContract, modelId: string): import("../../llm/ModelInfo.js").ModelInfo | undefined;
    /**
     * Parse the assistant answer, apply snippet edits, unpack full files,
     * and run the project test suite.
     *
     * @param {string} answer
     * @param {import('../../utils/FileSystem.js').FileSystem} fs
     * @param {string} cwd
     * @returns {Promise<{ unpackedFiles: string[], testResult: { code: number, stdout: string, stderr: string } | null }>}
     */
    static unpackAndTest(answer: string, fs: import("../../utils/FileSystem.js").FileSystem, cwd: string): Promise<{
        unpackedFiles: string[];
        testResult: {
            code: number;
            stdout: string;
            stderr: string;
        } | null;
    }>;
    /**
     * @param {Partial<ChatSessionModel> | Record<string, any>} [data]
     * @param {Partial<import('./AiModelAsApp.js').AiModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<ChatSessionModel> | Record<string, any>, options?: Partial<import("./AiModelAsApp.js").AiModelAsAppOptions>);
    /** @type {string} Unique identifier for the chat session */ id: string;
    /** @type {string} Date string formatted as YYYY-MM-DD for grouping logs */ date: string;
    /** @type {string} Initial input prompt or path to file */ input: string;
    /** @type {string} AI model to use for the session */ model: string;
    /** @type {string} Absolute path to the directory hosting the chat artifacts (.csv, .log, .md) */ logsPath: string;
    /** @type {'active' | 'ok' | 'failed'} Current status of the execution */ status: "active" | "ok" | "failed";
    /** @type {'boundary' | 'markdown'} Communication format */ communication: "boundary" | "markdown";
    /**
     * Generate system prompt from files in this.
     * @return {Promise<string>}
     */
    generateSystemPrompt(): Promise<string>;
    /**
     * Main execution loop for the Chat session
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, import('@nan0web/ui').ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
/**
 * Contract for the injected AI Engine
 */
export type AIEngineContract = {
    /**
     * The currently selected AI model
     */
    selectedModel: import("../../llm/ModelInfo.js").ModelInfo | null;
    /**
     * Get a model by ID
     */
    getModel: (arg0: string) => import("../../llm/ModelInfo.js").ModelInfo | undefined;
    /**
     * Find a model by partial ID
     */
    findModel: (arg0: string) => import("../../llm/ModelInfo.js").ModelInfo | undefined;
    /**
     * Stream text from AI
     */
    streamText: (arg0: string, arg1: any[], arg2: any | undefined) => import("ai").StreamTextResult<any, any>;
};
import { AiModelAsApp } from './AiModelAsApp.js';
