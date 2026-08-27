/**
 * AudioSplitter domain model (Model-as-App).
 * Platform-agnostic domain application controller for audio splitting and transcript merging.
 */
export class AudioSplitter extends ModelAsApp {
    static alias: string;
    /**
     * Resolves port and splits audio file.
     * @param {string} inputPath
     * @param {Object} [options]
     * @returns {Promise<string[]>}
     */
    static split(inputPath: string, options?: any): Promise<string[]>;
    /**
     * Resolves port and probes audio duration.
     * @param {string} inputPath
     * @param {Object} [options]
     * @returns {Promise<number|null>}
     */
    static probeDuration(inputPath: string, options?: any): Promise<number | null>;
    /**
     * Merge overlapping chunk transcripts with deduplication.
     * Pure domain algorithm.
     * @param {string[]} transcripts
     * @returns {string}
     */
    static mergeTranscripts(transcripts: string[], format?: string, options?: {}): string;
    /**
     * Find the length of overlapping text at the boundary of two chunks.
     * Pure domain algorithm.
     * @param {string} prev
     * @param {string} curr
     * @param {number} [maxOverlap=50]
     * @returns {number}
     */
    static _findOverlap(prev: string, curr: string, maxOverlap?: number): number;
}
import { ModelAsApp } from '@nan0web/ui';
