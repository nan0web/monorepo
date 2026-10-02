/**
 * CSV0Format - Format model for CSV0 documents (FrontMatter + CSV tabular body).
 */
export class CSV0Format extends Format {
    /**
     * @param {object} [data]
     * @param {object} [options]
     * @param {any} [options.db]
     * @param {FormatResolver} [options.resolver]
     */
    constructor(data?: object, options?: {
        db?: any;
        resolver?: FormatResolver | undefined;
    });
    resolver: FormatResolver;
    /**
     * Parses a raw CSV0 string into an object containing frontMatter, csvBody, meta, and typed rows.
     * @param {string} source
     * @param {object} [options]
     * @param {boolean} [options.typed]
     * @returns {{ frontMatter: string, csvBody: string, meta?: any, columns?: Record<string, any>, rows?: Array<Record<string, any>> }}
     */
    parse(source: string, options?: {
        typed?: boolean | undefined;
    }): {
        frontMatter: string;
        csvBody: string;
        meta?: any;
        columns?: Record<string, any>;
        rows?: Array<Record<string, any>>;
    };
    /**
     * Stringifies an array of objects or tabular structure into CSV0 format.
     * @param {Array<Record<string, any>>} rows
     * @param {object} [options]
     * @param {Record<string, any>} [options.columns]
     * @param {string} [options.title]
     * @param {Record<string, any>} [options.meta]
     * @returns {string}
     */
    stringify(rows: Array<Record<string, any>>, options?: {
        columns?: Record<string, any> | undefined;
        title?: string | undefined;
        meta?: Record<string, any> | undefined;
    }): string;
}
import { Format } from './Format.js';
import { FormatResolver } from './FormatResolver.js';
