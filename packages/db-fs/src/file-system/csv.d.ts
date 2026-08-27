/**
 * Loads and parses CSV file into array of objects.
 */
declare function loadCSV(filePath: any, delimiter?: string, quote?: string, softError?: boolean): any[];
/**
 * Loads and parses CSV file asynchronously.
 */
declare function loadCSVAsync(filePath: any, delimiter?: string, quote?: string, softError?: boolean): Promise<any[]>;
/**
 * Common logic to parse CSV string into objects.
 * @param {string} content
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @returns {any[]}
 */
declare function parseToObjects(content: string, delimiter?: string, quote?: string): any[];
/**
 * Parses CSV content into 2D array.
 */
declare function parseCSV(content: any, delimiter?: string, quote?: string): any[];
/**
 * Saves data as CSV file.
 */
declare function saveCSV(filePath: any, data: any, delimiter?: string, quote?: string, eol?: string): string;
/**
 * Saves data as CSV file asynchronously.
 */
declare function saveCSVAsync(filePath: any, data: any, delimiter?: string, quote?: string, eol?: string): Promise<string>;
/**
 * Internal logic for CSV stringification.
 * @param {any} data
 * @param {string} [delimiter]
 * @param {string} [quote]
 * @param {string} [eol]
 * @returns {string}
 */
declare function stringifyCSV(data: any, delimiter?: string, quote?: string, eol?: string): string;
export { loadCSV, saveCSV, parseCSV, loadCSVAsync, saveCSVAsync, parseToObjects, stringifyCSV };
