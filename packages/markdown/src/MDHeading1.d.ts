import MDHeading from './MDHeading.js';
/**
 * Heading1 element.
 */
export default class MDHeading1 extends MDHeading {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * Parses a heading1 from markdown text.
     * @param {string} text
     * @returns {MDHeading1|false}
     */
    static parse(text: string): MDHeading1 | false;
    /**
     * @param {*} input
     * @returns {MDHeading1}
     */
    static from(input: any): MDHeading1;
}
