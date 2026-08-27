/**
 * Parses a string containing OLMUI boundary markers into a structured file map.
 * This implementation uses manual offset/string analysis for performance,
 * avoiding Regular Expressions for large content streams.
 *
 * Format:
 * ---boundary:path/to/file.js---
 * ... content ...
 * ---boundary---
 *
 * Snippet Format (experimental):
 * ---boundary:path/to/file.js:33:3---
 * ... new 3-line replacement ...
 * ---boundary---
 *
 * @param {string} text The raw text received from the LLM or external agent.
 * @throws {Error} If a boundary is not closed or snippet constraints are violated.
 * @returns {Record<string, string>} Hash map of updated file contents.
 */
export declare function parseBoundaries(text: string): Record<string, string>;
/**
 * Applies parsed boundaries (full files or line-range snippets) to a set of original files.
 *
 * @param {Record<string, string>} originalFiles Map of original file paths to their contents.
 * @param {Record<string, string>} parsedBoundaries Map of parsed boundary keys to their contents.
 * @throws {Error} If snippet boundaries fall out of bounds of the original file.
 * @returns {Record<string, string>} Map of updated file contents.
 */
export declare function applyBoundaries(originalFiles: Record<string, string>, parsedBoundaries: Record<string, string>): Record<string, string>;
