import { Model } from '@nan0web/types';
/**
 * AiStrategy — defines the behavioral constraints and selection rules for AI models.
 *
 * Follows Model-as-Schema pattern for automatic UI generation and validation.
 */
export declare class AiStrategy extends Model {
    budget: number;
    rateLimitDelayMs: number;
    rateLimitRetries: number;
    static finance: {
        help: string;
        options: string[];
        default: string;
    };
    static speed: {
        help: string;
        options: string[];
        default: string;
    };
    static volume: {
        help: string;
        options: string[];
        default: string;
    };
    static level: {
        help: string;
        options: string[];
        default: string;
    };
    static budget: {
        help: string;
        default: number;
        validate: (v: any) => "Budget must be a non-negative number" | true;
    };
    static rateLimitDelayMs: {
        help: string;
        default: number;
    };
    static rateLimitRetries: {
        help: string;
        default: number;
    };
    /**
     * @param {Partial<AiStrategy> | Record<string, any>} [data] Initial state
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options] Model options
     */
    constructor(data?: Partial<AiStrategy> | Record<string, any>, options?: Partial<import('@nan0web/types').ModelOptions>);
    /**
     * @param {import('./ModelInfo.js').ModelInfo} model
     * @param {number} tokens
     * @param {number} [safeAnswerTokens=1_000]
     * @returns {boolean}
     */
    shouldChangeModel(model: import('./ModelInfo.js').ModelInfo, tokens: number, safeAnswerTokens?: number): boolean;
    /**
     * @param {Map<string, import('./ModelInfo.js').ModelInfo>} models
     * @param {number} tokens
     * @param {number} [safeAnswerTokens=1_000]
     * @returns {import('./ModelInfo.js').ModelInfo | undefined}
     */
    findModel(models: Map<string, import('./ModelInfo.js').ModelInfo>, tokens: number, safeAnswerTokens?: number): import('./ModelInfo.js').ModelInfo | undefined;
}
