import { Model } from '@nan0web/types';
/**
 * Embedder — computes text embeddings via an OpenAI-compatible endpoint.
 * Inherits from Model to follow Model-as-Schema v2.
 */
export declare class Embedder extends Model {
    /** @type {string} API root without slash */ baseURL: string;
    /** @type {typeof globalThis.fetch} Fetch platform override */
    _fetch: typeof globalThis.fetch;
    static UI: {
        errorFetchFailed: string;
    };
    static baseURL: {
        help: string;
        default: string;
    };
    static model: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<Embedder> & { fetch?: typeof globalThis.fetch } | Record<string, any>} [data] Initial state with optional fetch override
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options] Model options
     */
    constructor(data?: (Partial<Embedder> & {
        fetch?: typeof globalThis.fetch;
    }) | Record<string, any>, options?: Partial<import('@nan0web/types').ModelOptions>);
    /**
     * Checks whether the current model is an E5-Instruct variant
     * that requires query:/passage: prefix injection.
     * @returns {boolean}
     */
    isE5Instruct(): boolean;
    /**
     * Conditionally prepends E5-Instruct prefix to input texts.
     * @param {string[]} texts
     * @param {{ type?: 'query' | 'passage' }} [opts]
     * @returns {string[]}
     */
    prefixInput(texts: string[], opts?: {
        type?: 'query' | 'passage';
    }): string[];
    /**
     * Computes embeddings for single or multiple inputs.
     * @param {string|string[]} input
     * @param {{ type?: 'query' | 'passage' }} [opts]
     * @returns {Promise<number[] | number[][]>}
     */
    embed(input: string | string[], opts?: {
        type?: 'query' | 'passage';
    }): Promise<number[] | number[][]>;
    /**
     * @param {string[]} texts
     * @param {{ type?: 'query' | 'passage' }} [opts]
     * @returns {Promise<number[][]>}
     */
    embedBatch(texts: string[], opts?: {
        type?: 'query' | 'passage';
    }): Promise<number[][]>;
}
