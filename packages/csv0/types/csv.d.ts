/**
 * Pure CSV helpers — single source of truth for tabular (de)serialisation in the monorepo.
 * No I/O, no dependencies.
 */
/**
 * Decodes a raw CSV cell into a number when it looks numeric, otherwise returns trimmed text.
 * @param {any} value
 * @returns {any}
 */
export function decodeValue(value: any): any;
/**
 * Same as {@link decodeValue}, but also decodes `true` / `false` literals.
 * @param {any} value
 * @returns {any}
 */
export function decodeValueWithBooleans(value: any): any;
/**
 * Parses CSV content into a 2D array.
 * @param {string} content
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @param {(value: string) => any} [decode] Cell decoder, numbers by default.
 * @returns {any[][]}
 */
export function parseCSV(content: string, delimiter?: string, quote?: string, decode?: (value: string) => any): any[][];
/**
 * Converts a 2D array (first row = header) into an array of objects.
 * @param {any[][]} table
 * @returns {Array<Record<string, any>>}
 */
export function tableToObjects(table: any[][]): Array<Record<string, any>>;
/**
 * Parses CSV content straight into an array of objects.
 * @param {string} content
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @param {(value: string) => any} [decode]
 * @returns {Array<Record<string, any>>}
 */
export function parseCSVObjects(content: string, delimiter?: string, quote?: string, decode?: (value: string) => any): Array<Record<string, any>>;
/**
 * Stringifies an array of objects into CSV (header from the first row keys).
 * A string input is returned as is.
 * @param {any} rows
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @param {string} [eol]
 * @returns {string}
 */
export function stringifyCSV(rows: any, delimiter?: string, quote?: string, eol?: string): string;
