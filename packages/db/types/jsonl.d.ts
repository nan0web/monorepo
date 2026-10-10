/**
 * Pure JSONL (newline-delimited JSON) helpers.
 */
/**
 * Parses JSONL text into an array of values. Blank lines are skipped.
 * @param {string} text
 * @returns {any[]}
 */
export function parseJSONL(text: string): any[];
/**
 * Stringifies a value (or array of values) into JSONL text.
 * @param {any} data
 * @returns {string}
 */
export function stringifyJSONL(data: any): string;
