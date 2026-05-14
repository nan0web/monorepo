/**
 * Table element.
 */
export default class MDTable extends MDElement {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * Parses markdown table text into MDTable instance.
     * @param {string} text - Markdown text to parse
     * @param {{i?:number, rows?:string[]}} context - Parsing context (unused)
     * @returns {MDTable|false} Parsed MDTable instance or false if not a table
     */
    static parse(text: string, context?: {
        i?: number;
        rows?: string[];
    }): MDTable | false;
}
import MDElement from './MDElement.js';
