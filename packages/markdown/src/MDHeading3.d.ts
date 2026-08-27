import MDHeading from './MDHeading.js';
/**
 * Heading3 element.
 */
export default class MDHeading3 extends MDHeading {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * Parses a heading3 from markdown text.
     * @param {string} text
     * @returns {MDHeading3|false}
     */
    static parse(text: string): MDHeading3 | false;
    /**
     * @param {*} input
     * @returns {MDHeading3}
     */
    static from(input: any): MDHeading3;
}
