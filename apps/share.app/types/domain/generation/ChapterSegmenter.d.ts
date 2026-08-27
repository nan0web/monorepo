/**
 * @typedef {object} Chapter
 * @property {string} title - Chapter title (auto-generated from first words or segment text)
 * @property {number} startTime - Start time in seconds
 * @property {number} endTime - End time in seconds
 * @property {string} text - Full text content of the chapter
 * @property {string} [description] - Optional description
 * @property {string[]} [tags] - Optional tags
 */
/**
 * ChapterSegmenter — groups Whisper transcript segments into logical chapters
 * using detected pause points as natural boundaries.
 *
 * Snaps chapter boundaries to the nearest topic_boundary pauses, ensuring
 * clean cuts between speech sections without splitting mid-sentence.
 */
export class ChapterSegmenter extends PipelineNode<any, any> {
    constructor();
    /**
     * Segment a transcript into chapters based on detected pauses.
     *
     * @param {object} input
     * @param {object} input.transcript - Whisper JSON with segments[].words[]
     * @param {import('../analysis/SilencePauseAnalyzer.js').PauseMarker[]} input.pauses - Detected pauses
     * @param {object} [input.options]
     * @returns {Chapter[]}
     */
    segment(input: {
        transcript: object;
        pauses: import("../analysis/SilencePauseAnalyzer.js").PauseMarker[];
        options?: object;
    }): Chapter[];
    /**
     * Extract flat word array from Whisper JSON structure.
     * @param {object} whisperJson
     * @returns {Array<{word: string, start: number, end: number}>}
     */
    _extractWords(whisperJson: object): Array<{
        word: string;
        start: number;
        end: number;
    }>;
    /**
     * Generate a chapter title from the first ~8 words of text.
     * @param {string} text
     * @returns {string}
     */
    _generateTitle(text: string): string;
}
export type Chapter = {
    /**
     * - Chapter title (auto-generated from first words or segment text)
     */
    title: string;
    /**
     * - Start time in seconds
     */
    startTime: number;
    /**
     * - End time in seconds
     */
    endTime: number;
    /**
     * - Full text content of the chapter
     */
    text: string;
    /**
     * - Optional description
     */
    description?: string;
    /**
     * - Optional tags
     */
    tags?: string[];
};
import { PipelineNode } from '../pipeline/PipelineNode.js';
