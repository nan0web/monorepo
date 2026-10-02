/**
 * Parses a CSV0 string.
 * CSV0 is a CSV format with FrontMatter (YAML/nan0 format), separated by `---`.
 *
 * @param {string} source - The raw string content of a .csv0 file
 * @param {object} [options]
 * @param {boolean} [options.typed] - Whether to parse rows into typed JS objects
 * @returns {{ frontMatter: string, csvBody: string, meta?: any, columns?: Record<string, any>, rows?: Array<Record<string, any>> }}
 */
export function parseCSV0(source: string, options?: {
    typed?: boolean | undefined;
}): {
    frontMatter: string;
    csvBody: string;
    meta?: any;
    columns?: Record<string, any>;
    rows?: Array<Record<string, any>>;
};
/**
 * Stringifies an array of objects to CSV0 format with FrontMatter columns.
 * @param {Array<Record<string, any>>} rows
 * @param {object} [options]
 * @param {Record<string, any>} [options.columns]
 * @param {string} [options.title]
 * @param {Record<string, any>} [options.meta]
 * @returns {string}
 */
export function stringifyCSV0(rows: Array<Record<string, any>>, options?: {
    columns?: Record<string, any> | undefined;
    title?: string | undefined;
    meta?: Record<string, any> | undefined;
}): string;
export * from "./domain/Format.js";
export * from "./domain/CSV0Format.js";
export * from "./domain/FormatResolver.js";
export * from "./domain/formats/BooleanFormat.js";
export * from "./domain/formats/StringFormat.js";
export * from "./domain/formats/NumberFormat.js";
export * from "./domain/formats/index.js";
