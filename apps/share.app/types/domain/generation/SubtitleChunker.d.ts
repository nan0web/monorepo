/**
 * Estimates pixel width of a text string for the target font.
 * @param {string} text
 * @returns {number}
 */
export function estimateTextWidth(text: string): number;
/**
 * @typedef {object} WordEntry
 * @property {string} word
 * @property {number} start
 * @property {number} end
 */
/**
 * @typedef {object} SubtitleBlock
 * @property {string} text - The combined text for this block
 * @property {number} start - Start time in seconds
 * @property {number} end - End time in seconds
 * @property {number} wordCount - Number of words in this block
 * @property {number} estimatedWidth - Estimated pixel width
 */
/**
 * Groups words into subtitle blocks.
 *
 * Whisper JSON structure expected:
 * { segments: [ { words: [ { word: 'hello', start: 0.1, end: 0.5 }, ... ] } ] }
 *
 * @param {Array<{ segments: Array<{ words: Array<WordEntry> }> }>|Array<WordEntry>} transcriptData
 *        Either the full transcript object with segments, or a flat array of WordEntry.
 * @param {object} [options]
 * @param {number} [options.maxWidth=850] - Maximum pixel width for a block
 * @param {number} [options.maxWords=3] - Maximum words per block
 * @returns {Array<SubtitleBlock>}
 */
export function chunkTranscript(transcriptData: Array<{
    segments: Array<{
        words: Array<WordEntry>;
    }>;
}> | Array<WordEntry>, options?: {
    maxWidth?: number;
    maxWords?: number;
}): Array<SubtitleBlock>;
/**
 * Converts an array of SubtitleBlock to ASS format content string.
 *
 * @param {Array<SubtitleBlock>} blocks
 * @param {object} [options]
 * @param {number} [options.playResX=1920]
 * @param {number} [options.playResY=1080]
 * @param {string} [options.style] - Full ASS Style line (overrides default)
 * @returns {string}
 */
export function blocksToAss(blocks: Array<SubtitleBlock>, options?: {
    playResX?: number;
    playResY?: number;
    style?: string;
}): string;
/**
 * Converts an array of SubtitleBlock to SRT format string.
 * @param {Array<SubtitleBlock>} blocks
 * @param {object} [options]
 * @param {number} [options.offset=0] - Offset in seconds to subtract from timestamps
 * @returns {string}
 */
export function blocksToSrt(blocks: Array<SubtitleBlock>, options?: {
    offset?: number;
}): string;
/**
 * Converts an array of SubtitleBlock to WebVTT (.vtt) format string.
 * @param {Array<SubtitleBlock>} blocks
 * @param {object} [options]
 * @param {number} [options.offset=0] - Offset in seconds to subtract from timestamps
 * @returns {string}
 */
export function blocksToVtt(blocks: Array<SubtitleBlock>, options?: {
    offset?: number;
}): string;
/**
 * Formats seconds to SRT time format (HH:MM:SS,mmm)
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimeSrt(seconds: number): string;
/**
 * Formats seconds to WebVTT time format (HH:MM:SS.mmm)
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimeVtt(seconds: number): string;
export type WordEntry = {
    word: string;
    start: number;
    end: number;
};
export type SubtitleBlock = {
    /**
     * - The combined text for this block
     */
    text: string;
    /**
     * - Start time in seconds
     */
    start: number;
    /**
     * - End time in seconds
     */
    end: number;
    /**
     * - Number of words in this block
     */
    wordCount: number;
    /**
     * - Estimated pixel width
     */
    estimatedWidth: number;
};
