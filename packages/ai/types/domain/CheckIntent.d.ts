import { ModelAsApp } from '@nan0web/ui-cli';
/**
 * CheckIntent — Universal Multi-Format Contract & Syntax Validator (JS/TS, JSON, JSONL, SRT, VTT, Markdown).
 */
export declare class CheckIntent extends ModelAsApp {
    /** @type {string[]} */
    files: string[];
    static alias: string;
    static UI: {
        title: string;
        icon: string;
    };
    static file: {
        help: string;
        type: string;
        positional: boolean;
    };
    static files: {
        help: string;
        type: string;
    };
    /**
     * @param {Partial<CheckIntent> | Record<string, any>} [data] Initial state
     * @param {any} [options] Model options
     */
    constructor(data?: Partial<CheckIntent> | Record<string, any>, options?: any);
    /**
     * @returns {AsyncGenerator<any, any, any>}
     */
    run(): AsyncGenerator<any, any, any>;
    /**
     * Validates file content based on extension.
     * @param {string} file
     * @param {string} content
     * @param {string} root
     * @returns {Promise<{ valid: boolean, error?: string }>}
     */
    validateFileContent(file: string, content: string, root: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
    /**
     * Validate SRT or VTT subtitle structure and timestamp sequences.
     * @param {string} content
     * @param {string} ext
     * @returns {{ valid: boolean, error?: string }}
     */
    validateSubtitles(content: string, ext: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * Validate Markdown for balanced code blocks and basic integrity.
     * @param {string} content
     * @returns {{ valid: boolean, error?: string }}
     */
    validateMarkdown(content: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * @param {string} root
     * @returns {Promise<string[]>}
     */
    _getModifiedFiles(root: string): Promise<string[]>;
    /**
     * @param {string} file
     * @param {string} root
     * @returns {Promise<{ valid: boolean, error?: string }>}
     */
    _checkSyntaxNode(file: string, root: string): Promise<{
        valid: boolean;
        error?: string;
    }>;
}
