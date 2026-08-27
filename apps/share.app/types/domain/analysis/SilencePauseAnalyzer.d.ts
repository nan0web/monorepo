/**
 * @typedef {object} PauseMarker
 * @property {number} start - Start time of the pause (end of previous word)
 * @property {number} end - End time of the pause (start of next word)
 * @property {number} duration - Duration of the pause in seconds
 * @property {'silence'|'breath'|'topic_boundary'} type - Classification of the pause
 */
/**
 * @typedef {object} SilencePauseAnalyzerOptions
 * @property {number} [minPauseDuration=0.8] - Minimum pause duration to detect (seconds)
 * @property {number} [breathThreshold=1.2] - Pauses shorter than this but >= minPauseDuration are classified as 'breath'
 * @property {number} [topicBoundaryThreshold=1.5] - Pauses >= this are classified as 'topic_boundary'
 */
/**
 * SilencePauseAnalyzer — detects pauses and silence gaps in Whisper JSON transcripts.
 *
 * Analyzes word-level timestamps to find natural cut points.
 * Classification thresholds:
 * - silence: minPauseDuration <= duration < breathThreshold
 * - breath: breathThreshold <= duration < topicBoundaryThreshold
 * - topic_boundary: duration >= topicBoundaryThreshold
 */
export class SilencePauseAnalyzer extends PipelineNode<any, any> {
    constructor();
    /**
     * Analyze a Whisper JSON transcript for pauses between words.
     *
     * @param {object} whisperJson - Whisper JSON with segments[].words[] containing {word, start, end}
     * @param {SilencePauseAnalyzerOptions} [options]
     * @returns {PauseMarker[]}
     */
    analyze(whisperJson: object, options?: SilencePauseAnalyzerOptions): PauseMarker[];
    /**
     * PipelineNode interface: process Whisper JSON and return pauses.
     * @param {object} input - { transcript: WhisperJSON, options?: SilencePauseAnalyzerOptions }
     * @returns {Promise<{ pauses: PauseMarker[], transcript: object }>}
     */
    process(input: object): Promise<{
        pauses: PauseMarker[];
        transcript: object;
    }>;
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
     * Classify a pause based on its duration.
     * @param {number} duration
     * @param {number} breathThreshold
     * @param {number} topicBoundaryThreshold
     * @returns {'silence'|'breath'|'topic_boundary'}
     */
    _classifyPause(duration: number, breathThreshold: number, topicBoundaryThreshold: number): "silence" | "breath" | "topic_boundary";
}
export type PauseMarker = {
    /**
     * - Start time of the pause (end of previous word)
     */
    start: number;
    /**
     * - End time of the pause (start of next word)
     */
    end: number;
    /**
     * - Duration of the pause in seconds
     */
    duration: number;
    /**
     * - Classification of the pause
     */
    type: "silence" | "breath" | "topic_boundary";
};
export type SilencePauseAnalyzerOptions = {
    /**
     * - Minimum pause duration to detect (seconds)
     */
    minPauseDuration?: number;
    /**
     * - Pauses shorter than this but >= minPauseDuration are classified as 'breath'
     */
    breathThreshold?: number;
    /**
     * - Pauses >= this are classified as 'topic_boundary'
     */
    topicBoundaryThreshold?: number;
};
import { PipelineNode } from '../pipeline/PipelineNode.js';
