/**
 * 📐 MODEL-AS-SCHEMA + MODEL-AS-APP
 * Domain Model for the LLiMo Subagent (Headless JSONL Worker).
 *
 * @property {string} model LLM model ID (e.g. qwen/qwen-3)
 * @property {string} provider API provider (e.g. openrouter, cerebras)
 * @property {string} strategy Fallback strategy name from ai-strategy.yaml
 * @property {string} input Raw prompt text
 * @property {string} file Path to a file with the prompt content
 * @property {string} system System prompt override
 */
export class SubagentModel extends AiModelAsApp {
    static alias: string;
    static model: {
        help: string;
        default: string;
    };
    static provider: {
        help: string;
        default: string;
    };
    static strategy: {
        help: string;
        default: string;
    };
    static input: {
        help: string;
        default: string;
        validate: (val: any, instance: any) => true | "input_or_file_required";
    };
    static file: {
        help: string;
        default: string;
    };
    static system: {
        help: string;
        default: string;
    };
    static UI: {
        model_or_strategy_required: string;
        input_or_file_required: string;
        file_not_found: string;
        connecting: string;
        generating: string;
        generation_failed: string;
        json_parse_failed: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ model: string;
    /** @type {string} */ provider: string;
    /** @type {string} */ strategy: string;
    /** @type {string} */ input: string;
    /** @type {string} */ file: string;
    /** @type {string} */ system: string;
    modelInfo: any;
    /**
     * @override
     * @returns {AsyncGenerator<any, any, any>}
     */
    override run(): AsyncGenerator<any, any, any>;
}
import { AiModelAsApp } from './AiModelAsApp.js';
