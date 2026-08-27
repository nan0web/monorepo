import MDHeading from './MDHeading.js';
/**
 * Heading4 element.
 */
export default class MDHeading4 extends MDHeading {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * Parses a heading4 from markdown text.
     * @param {string} text
     * @returns {MDHeading4|false}
     */
    static parse(text: string): MDHeading4 | false;
    /**
     * @param {*} input
     * @returns {MDHeading4}
     */
    static from(input: any): MDHeading4;
}
