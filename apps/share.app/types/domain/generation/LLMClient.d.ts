/**
 * LLMClient — Bridge to @nan0web/ai kernel with session metrics and streaming support.
 */
export class LLMClient {
    /** @type {AI?} */
    static "__#private@#ai": AI | null;
    /**
     * Get or lazily initialize the singleton @nan0web/ai instance.
     * @returns {Promise<AI>}
     */
    static getAI(): Promise<AI>;
    /**
     * Accumulated session metrics.
     */
    static metrics: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        totalCost: number;
        calls: number;
    };
    /**
     * Reset session metrics.
     */
    static resetMetrics(): void;
    /**
     * Send a prompt using @nan0web/ai with automatic fallback, streaming, and cost calculation.
     * @param {string} prompt
     * @param {object} [options]
     * @param {string} [options.system]
     * @param {string} [options.model]
     * @param {number} [options.temperature]
     * @param {Function} [options.onToken] - (chunk: string, fullTextSoFar: string) => void
     * @returns {Promise<string|null>}
     */
    static complete(prompt: string, options?: {
        system?: string;
        model?: string;
        temperature?: number;
        onToken?: Function;
    }): Promise<string | null>;
}
import { AI } from '@nan0web/ai';
