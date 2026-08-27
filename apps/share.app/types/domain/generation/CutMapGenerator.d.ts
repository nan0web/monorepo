/**
 * @typedef {object} CutMapSegment
 * @property {string} label - Segment identifier (e.g. 'intro', 'chapter_1', 'short_1')
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {'episode'|'short'|'intro'|'outro'} type - Segment type
 * @property {string} [aspectRatio] - Per-segment aspect ratio override (e.g. '9:16', '16:9')
 * @property {string} [title] - Segment title
 * @property {string} [description] - Segment description
 * @property {string[]} [tags] - Segment tags
 */
/**
 * @typedef {object} CutMap
 * @property {number} version - Schema version (always 1)
 * @property {string} source - Source video file path
 * @property {string} aspectRatio - Default aspect ratio for all segments
 * @property {CutMapSegment[]} segments - Array of cut segments
 */
/**
 * CutMapGenerator — generates a YAML-compatible cut-map from detected pauses and word data.
 *
 * The cut-map is a configuration file that the author reviews and edits
 * before executing the actual video slicing. Each segment defines start/end
 * times, type (episode/short), and optional aspect ratio override.
 */
export class CutMapGenerator extends PipelineNode<any, any> {
    /**
     * Serialize a CutMap object to YAML string.
     * Lightweight serializer — no external deps.
     *
     * @param {CutMap} cutMap
     * @returns {string}
     */
    static toYaml(cutMap: CutMap): string;
    constructor();
    /**
     * Generate a cut-map object from pauses and word-level timestamps.
     *
     * @param {object} input
     * @param {import('../analysis/SilencePauseAnalyzer.js').PauseMarker[]} input.pauses - Detected pauses
     * @param {Array<{word: string, start: number, end: number}>} input.words - Word-level timestamps
     * @param {string} [input.source='video.mp4'] - Source video path
     * @param {string} [input.defaultAspectRatio='16:9'] - Default aspect ratio
     * @returns {CutMap}
     */
    generate(input: {
        pauses: import("../analysis/SilencePauseAnalyzer.js").PauseMarker[];
        words: Array<{
            word: string;
            start: number;
            end: number;
        }>;
        source?: string;
        defaultAspectRatio?: string;
    }): CutMap;
    /**
     * Extract flat word array from Whisper JSON.
     * @param {object} whisperJson
     * @returns {Array<{word: string, start: number, end: number}>}
     */
    _extractWords(whisperJson: object): Array<{
        word: string;
        start: number;
        end: number;
    }>;
}
export type CutMapSegment = {
    /**
     * - Segment identifier (e.g. 'intro', 'chapter_1', 'short_1')
     */
    label: string;
    /**
     * - Start time in seconds
     */
    start: number;
    /**
     * - End time in seconds
     */
    end: number;
    /**
     * - Segment type
     */
    type: "episode" | "short" | "intro" | "outro";
    /**
     * - Per-segment aspect ratio override (e.g. '9:16', '16:9')
     */
    aspectRatio?: string;
    /**
     * - Segment title
     */
    title?: string;
    /**
     * - Segment description
     */
    description?: string;
    /**
     * - Segment tags
     */
    tags?: string[];
};
export type CutMap = {
    /**
     * - Schema version (always 1)
     */
    version: number;
    /**
     * - Source video file path
     */
    source: string;
    /**
     * - Default aspect ratio for all segments
     */
    aspectRatio: string;
    /**
     * - Array of cut segments
     */
    segments: CutMapSegment[];
};
import { PipelineNode } from '../pipeline/PipelineNode.js';
