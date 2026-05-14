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
export class SubagentModel extends Model {
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
    /**
     * @param {Partial<SubagentModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { db?: any, ai?: any }} [options]
     */
    constructor(data?: Partial<SubagentModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        db?: any;
        ai?: any;
    });
    /** @type {any} LLM model ID (e.g. qwen/qwen-3) */ model: any;
    /** @type {any} API provider (e.g. openrouter, cerebras) */ provider: any;
    /** @type {any} Fallback strategy name from ai-strategy.yaml */ strategy: any;
    /** @type {any} Raw prompt text */ input: any;
    /** @type {any} Path to a file with the prompt content */ file: any;
    /** @type {any} System prompt override */ system: any;
    /**
     * Main execution generator — yields OLMUI intents.
     * The adapter (CLI, headless JSONL, test harness) decides how to render them.
     *
     * @param {{ ai: import('../../src/llm/AI.js').AI, modelInfo: any }} deps
     */
    run(deps: {
        ai: import("../../src/llm/AI.js").AI;
        modelInfo: any;
    }): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
        msg?: undefined;
        model?: undefined;
        text?: undefined;
        provider?: undefined;
        usage?: undefined;
        stats?: undefined;
    } | {
        type: string;
        msg: string;
        model: {
            id: any;
            name: any;
            provider: any;
            context_length: any;
            maximum_output: any;
            pricing: {
                prompt: any;
                completion: any;
            };
        };
        level?: undefined;
        message?: undefined;
        text?: undefined;
        provider?: undefined;
        usage?: undefined;
        stats?: undefined;
    } | {
        type: string;
        message: string;
        level?: undefined;
        msg?: undefined;
        model?: undefined;
        text?: undefined;
        provider?: undefined;
        usage?: undefined;
        stats?: undefined;
    } | {
        type: string;
        text: string;
        level?: undefined;
        message?: undefined;
        msg?: undefined;
        model?: undefined;
        provider?: undefined;
        usage?: undefined;
        stats?: undefined;
    } | {
        type: string;
        model: any;
        provider: any;
        usage: {
            promptTokens: any;
            completionTokens: any;
            totalTokens: any;
        };
        stats: {
            speed: number;
            cost: number;
            time: number;
        };
        level?: undefined;
        message?: undefined;
        msg?: undefined;
        text?: undefined;
    }, {
        status: string;
        reason: string;
        error?: undefined;
        raw?: undefined;
        type?: undefined;
        payload?: undefined;
    } | {
        status: string;
        reason: string;
        error: any;
        raw?: undefined;
        type?: undefined;
        payload?: undefined;
    } | {
        status: string;
        reason: string;
        raw: string;
        error?: undefined;
        type?: undefined;
        payload?: undefined;
    } | {
        type: string;
        payload: any;
        status?: undefined;
        reason?: undefined;
        error?: undefined;
        raw?: undefined;
    }, unknown>;
}
import { Model } from '@nan0web/types';
