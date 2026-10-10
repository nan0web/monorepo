/**
 * CSV0Format - Format model for CSV0 documents (FrontMatter + CSV tabular body).
 */
export class CSV0Format extends Format {
    /**
     * @param {object} [data]
     * @param {object} [options]
     * @param {import('@nan0web/db').default} [options.db] Database instance
     * @param {FormatResolver} [options.resolver]
     */
    constructor(data?: object, options?: {
        db?: import("@nan0web/db").default;
        resolver?: FormatResolver;
    });
    resolver: FormatResolver;
    /**
     * Evaluates a simple mathematical expression for a row or aggregate scope.
     * @param {string} expr
     * @param {Record<string, any>} scope
     * @returns {any}
     */
    _evalExpr(expr: string, scope: Record<string, any>): any;
    /**
     * Parses a raw CSV0 string into an object containing frontMatter, csvBody, meta, head, columns, rows, and totals.
     * @param {string} source
     * @param {object} [options]
     * @param {boolean} [options.typed]
     * @param {Record<string, any>} [options.columns]
     * @param {Record<string, any>} [options.head]
     * @returns {{ frontMatter: string, csvBody: string, meta?: any, head?: any, columns?: Record<string, any>, rows?: Array<Record<string, any>>, totals?: Record<string, any> }}
     */
    parse(source: string, options?: {
        typed?: boolean;
        columns?: Record<string, any>;
        head?: Record<string, any>;
    }): {
        frontMatter: string;
        csvBody: string;
        meta?: any;
        head?: any;
        columns?: Record<string, any>;
        rows?: Array<Record<string, any>>;
        totals?: Record<string, any>;
    };
    /**
     * Stringifies an array of objects or tabular structure into CSV0 format.
     * @param {Array<Record<string, any>>} rows
     * @param {object} [options]
     * @param {Record<string, any>} [options.columns]
     * @param {Record<string, any> | boolean} [options.head]
     * @param {string} [options.title]
     * @param {Record<string, any>} [options.meta]
     * @param {boolean} [options.commented] Emit `# ---` commented FrontMatter (Edit CSV compatible)
     * @returns {string}
     */
    stringify(rows: Array<Record<string, any>>, options?: {
        columns?: Record<string, any>;
        head?: Record<string, any> | boolean;
        title?: string;
        meta?: Record<string, any>;
        commented?: boolean;
    }): string;
}
import { Format } from './Format.js';
import { FormatResolver } from './FormatResolver.js';
