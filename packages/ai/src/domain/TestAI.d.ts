/**
 * @typedef {import('ai').StreamTextResult<any, any>} StreamTextResult
 * @typedef {import('ai').ModelMessage} ModelMessage
 */
export type StreamTextResult = import('ai').StreamTextResult<any, any>;
export type ModelMessage = import('ai').ModelMessage;
import { AI } from './AI.js';
import { Usage } from './Usage.js';
/**
 * TestAI extends AI to simulate chat responses without real API calls.
 *
 * Responses can be provided in-memory via the constructor.
 *
 * @example
 * const ai = new TestAI(['Hello!', 'World!'])
 * const result = await ai.streamText(null, [])
 * // result.text === 'Hello!'
 */
export declare class TestAI extends AI {
    #private;
    /**
     * @param {string[]} [responses] Pre-recorded text responses.
     */
    constructor(responses?: string[]);
    streamText(model: any, messages: any, options?: {}): Promise<{
        id: any;
        text: string;
        reasoning: string;
        content: string;
        reasoningText: string;
        textStream: {
            [Symbol.asyncIterator]: () => AsyncGenerator<string, void, unknown>;
        };
        usage: Usage;
        rawCall: {
            messageId: any;
        };
        experimental_output: never[];
        warnings: never[];
        files: never[];
        sources: never[];
        toolCalls: never[];
        toolResults: never[];
        finishReason: string;
        stopReason: string;
        response: {
            id: string;
            timestamp: Date;
            modelId: string;
            headers: {};
            messages: never[];
        };
    }>;
    /**
     * Non-streaming version.
     * @param {any} model
     * @param {ModelMessage[]} messages
     * @param {object} [options]
     * @returns {Promise<{text: string, usage: Usage, usedModel: any, usedProvider: any}>}
     */
    generateText(model: any, messages: ModelMessage[], options?: object): Promise<{
        text: string;
        usage: Usage;
        usedModel: any;
        usedProvider: any;
    }>;
}
