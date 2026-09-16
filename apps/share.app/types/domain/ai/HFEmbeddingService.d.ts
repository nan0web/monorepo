/**
 * HFEmbeddingService - Client for generating text embeddings via Hugging Face Spaces / Inference API.
 */
export class HFEmbeddingService {
    /**
     * @param {object} [options]
     * @param {string} [options.spaceUrl]
     * @param {string} [options.token]
     */
    constructor(options?: {
        spaceUrl?: string;
        token?: string;
    });
    spaceUrl: string;
    token: string;
    /**
     * Formats standard payload for HF feature-extraction pipeline.
     * @param {string|string[]} inputs
     * @returns {object}
     */
    buildRequestPayload(inputs: string | string[]): object;
    /**
     * Generates embedding vector for a single text chunk.
     * @param {string} text
     * @returns {Promise<number[]>}
     */
    embed(text: string): Promise<number[]>;
    /**
     * Generates embeddings for a batch of text chunks.
     * @param {string[]} texts
     * @returns {Promise<number[][]>}
     */
    embedBatch(texts: string[]): Promise<number[][]>;
}
