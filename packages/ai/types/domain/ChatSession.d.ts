/** @typedef {{ role: string, content: string }} ChatMessage */
export class ChatConfig {
    constructor(input?: {});
    model: string;
    provider: string;
}
/**
 * Manages chat history and artifacts in the file system.
 */
export class ChatSession {
    /**
     * @param {Object} [input={}]
     * @param {string} [input.id]
     * @param {string} [input.cwd]
     * @param {string} [input.root='chat']
     * @param {ChatMessage[]} [input.messages=[]]
     * @param {{ files?: string[], task?: string, meta?: Record<string, any> }} [input.context]
     * @param {number} [input.maxRetries=3]
     */
    constructor(input?: {
        id?: string;
        cwd?: string;
        root?: string;
        messages?: ChatMessage[];
        context?: {
            files?: string[];
            task?: string;
            meta?: Record<string, any>;
        };
        maxRetries?: number;
    });
    /** @type {string} Session ID */ id: string;
    /** @type {string} Working directory */ cwd: string;
    /** @type {ChatMessage[]} Message history */
    messages: ChatMessage[];
    /** @type {{ files: string[], task: string, meta: Record<string, any> }} */
    context: {
        files: string[];
        task: string;
        meta: Record<string, any>;
    };
    /** @type {string[]} Error collection from quality gates */
    errors: string[];
    /** @type {number} Number of self-healing retries performed */
    retries: number;
    /** @type {number} Maximum allowed retries before requiring user approval */
    maxRetries: number;
    root: string;
    /**
     * Registers a file into the active chat context if not already present.
     * Updates the modification timestamp in context metadata.
     * @param {string} file
     */
    addFile(file: string): void;
    /**
     * Removes a file from active context.
     * @param {string} file
     */
    removeFile(file: string): void;
    /**
     * Checks if a file exists in the active context.
     * @param {string} file
     * @returns {boolean}
     */
    hasFile(file: string): boolean;
    /**
     * Marks that a file has been modified or touched with current timestamp.
     * @param {string} file
     */
    touchFile(file: string): void;
    /**
     * Adds error or list of errors into session.
     * @param {string|string[]} errorOrErrors
     */
    addError(errorOrErrors: string | string[]): void;
    /**
     * Check if any errors occurred during verification.
     * @returns {boolean}
     */
    hasErrors(): boolean;
    /**
     * Reset errors for a new validation cycle.
     */
    resetErrors(): void;
    /**
     * Check if automatic retry is permitted.
     * @returns {boolean}
     */
    canContinue(): boolean;
    /**
     * Increment retry counter.
     */
    nextRetry(): void;
    get dir(): string;
    /**
     * Initialize session directory.
     */
    init(): Promise<void>;
    /**
     * Add a message to the history.
     * @param {ChatMessage} message
     */
    add(message: ChatMessage): void;
    /**
     * Save the current state of messages to messages.jsonl.
     */
    save(): Promise<void>;
    /**
     * Load messages from the file system.
     */
    load(): Promise<boolean>;
    /**
     * Save a specific artifact (like answer.md or prompt.md).
     * @param {string} filename
     * @param {string} content
     */
    saveArtifact(filename: string, content: string): Promise<void>;
    /**
     * Append content to a file (useful for streaming logs).
     * @param {string} filename
     * @param {string} content
     */
    appendArtifact(filename: string, content: string): Promise<void>;
    #private;
}
export type ChatMessage = {
    role: string;
    content: string;
};
