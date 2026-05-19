/**
 * Loads and parses CSV file into array of objects.
 */
export function loadCSV(filePath: any, delimiter?: string, quote?: string, softError?: boolean): any[];
/**
 * Saves data as CSV file.
 */
export function saveCSV(filePath: any, data: any, delimiter?: string, quote?: string, eol?: string): string;
/**
 * Parses CSV content into 2D array.
 */
export function parseCSV(content: any, delimiter?: string, quote?: string): any[][];
/**
 * Loads and parses CSV file asynchronously.
 */
export function loadCSVAsync(filePath: any, delimiter?: string, quote?: string, softError?: boolean): Promise<any[]>;
/**
 * Saves data as CSV file asynchronously.
 */
export function saveCSVAsync(filePath: any, data: any, delimiter?: string, quote?: string, eol?: string): Promise<string>;
/**
 * Common logic to parse CSV string into objects.
 * @param {string} content
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @returns {any[]}
 */
export function parseToObjects(content: string, delimiter?: string, quote?: string): any[];
/**
 * Internal logic for CSV stringification.
 * @param {any} data
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @param {string} [eol]
 * @returns {string}
 */
export function stringifyCSV(data: any, delimiter?: string, quote?: string, eol?: string): string;
