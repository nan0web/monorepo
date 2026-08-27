import MDHeading from './MDHeading.js';
/**
 * Heading6 element.
 */
export default class MDHeading6 extends MDHeading {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * Parses a heading6 from markdown text.
     * @param {string} text
     * @returns {MDHeading6|false}
     */
    static parse(text: string): MDHeading6 | false;
    /**
     * @param {*} input
     * @returns {MDHeading6}
     */
    static from(input: any): MDHeading6;
}
