import MDHeading from './MDHeading.js';
/**
 * Heading2 element.
 */
export default class MDHeading2 extends MDHeading {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * Parses a heading2 from markdown text.
     * @param {string} text
     * @returns {MDHeading2|false}
     */
    static parse(text: string): MDHeading2 | false;
    /**
     * @param {*} input
     * @returns {MDHeading2}
     */
    static from(input: any): MDHeading2;
}
