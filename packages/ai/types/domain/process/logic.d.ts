/**
 * @typedef {Object} TestedFile
 * @property {boolean} ok
 * @property {string[]} [errors]
 */
/**
 * @typedef {Object} LLMRunner
 * @property {(file: string) => Promise<TestedFile>} [checkFile] Node.js syntax checker
 * @property {(file: string) => Promise<TestedFile>} [prettyFile] Prettier/code style checker
 * @property {(file: string) => Promise<TestedFile>} [testFile] Unit/Story test runner
 * @property {(file: string) => Promise<TestedFile>} [buildFile] Type/bundler build runner
 * @property {(chat: ChatSession) => Promise<TestedFile>} [testProject] Full project test runner
 */
/**
 * @typedef {Object} LLMInspector
 * @property {(chat: ChatSession) => Promise<TestedFile>} [inspectProject] Project architectural inspector
 */
/**
 * @typedef {Object} LLMAgentOptions
 * @property {LLMRunner} [runner] Execution runner adapter for processes
 * @property {LLMInspector} [inspector] Inspector runner adapter for architecture inspection
 */
export class LLMAgent extends ModelAsApp {
    static UI: {
        starting: string;
        preflightFailed: string;
        hasErrors: string;
        hasErrorsNoContinue: string;
    };
    static autoContinue: {
        options: string[];
        value: string;
        help: string;
    };
    static skipProjectTests: {
        help: string;
        value: boolean;
    };
    static skipPreflight: {
        help: string;
        value: boolean;
    };
    /**
     * @param {Partial<LLMAgent>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions & LLMAgentOptions>} [options={}]
     */
    constructor(data?: Partial<LLMAgent>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions & LLMAgentOptions>);
    /** @type {string} Continue automatically after errors (Yes/No) */ autoContinue: string;
    /** @type {boolean} Skip full project tests */ skipProjectTests: boolean;
    /** @type {boolean} Skip pre-flight baseline check before chat */ skipPreflight: boolean;
    /** @type {LLMRunner | null} */ runner: LLMRunner | null;
    /** @type {LLMInspector | null} */ inspector: LLMInspector | null;
    createChat(input?: {}): ChatSession;
    readTask(chat: any): AsyncGenerator<never, void, unknown>;
    collectContext(chat: any): AsyncGenerator<never, void, unknown>;
    /**
     * Node.js syntax check (node --check <file>)
     * @param {string} file
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
     */
    checkFile(file: string): AsyncGenerator<import("@nan0web/ui").Intent, TestedFile, any>;
    /**
     * Formats and validates code hygiene (*.{js|md|yaml|yml|json|jsonl})
     * @param {string} file
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
     */
    prettyFile(file: string): AsyncGenerator<import("@nan0web/ui").Intent, TestedFile, any>;
    /**
     * Tests *.test.js or *.story.js file only, otherwise returns { ok: true }
     * @param {string} file
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
     */
    testFile(file: string): AsyncGenerator<import("@nan0web/ui").Intent, TestedFile, any>;
    /**
     * Builds / type checks *.js file, otherwise returns { ok: true }
     * @param {string} file
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
     */
    buildFile(file: string): AsyncGenerator<import("@nan0web/ui").Intent, TestedFile, any>;
    /**
     * Tests all test files registered in the context.
     * @param {ChatSession} chat
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
     */
    testContext(chat: ChatSession): AsyncGenerator<import("@nan0web/ui").Intent, TestedFile, any>;
    /**
     * Runs full project tests suite if not skipped.
     * Only invoked when all previous unit and context gates passed.
     * @param {ChatSession} chat
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
     */
    testProject(chat: ChatSession): AsyncGenerator<import("@nan0web/ui").Intent, TestedFile, any>;
    /**
     * Runs project architectural inspection via @nan0web/inspect.
     * Only invoked when tests are 100% green.
     * @param {ChatSession} chat
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, TestedFile, any>}
     */
    inspectProject(chat: ChatSession): AsyncGenerator<import("@nan0web/ui").Intent, TestedFile, any>;
    /**
     * Queries LLM with task and error context to generate or modify files.
     * @param {ChatSession} chat
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, { files: string[], chat: ChatSession }, any>}
     */
    processChat(chat: ChatSession): AsyncGenerator<import("@nan0web/ui").Intent, {
        files: string[];
        chat: ChatSession;
    }, any>;
}
export type TestedFile = {
    ok: boolean;
    errors?: string[];
};
export type LLMRunner = {
    /**
     * Node.js syntax checker
     */
    checkFile?: (file: string) => Promise<TestedFile>;
    /**
     * Prettier/code style checker
     */
    prettyFile?: (file: string) => Promise<TestedFile>;
    /**
     * Unit/Story test runner
     */
    testFile?: (file: string) => Promise<TestedFile>;
    /**
     * Type/bundler build runner
     */
    buildFile?: (file: string) => Promise<TestedFile>;
    /**
     * Full project test runner
     */
    testProject?: (chat: ChatSession) => Promise<TestedFile>;
};
export type LLMInspector = {
    /**
     * Project architectural inspector
     */
    inspectProject?: (chat: ChatSession) => Promise<TestedFile>;
};
export type LLMAgentOptions = {
    /**
     * Execution runner adapter for processes
     */
    runner?: LLMRunner;
    /**
     * Inspector runner adapter for architecture inspection
     */
    inspector?: LLMInspector;
};
import { ModelAsApp } from '@nan0web/ui';
import { ChatSession } from '../ChatSession.js';
