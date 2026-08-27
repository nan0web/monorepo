import MDHeading from './MDHeading.js';
/**
 * Heading5 element.
 */
export default class MDHeading5 extends MDHeading {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * Parses a heading5 from markdown text.
     * @param {string} text
     * @returns {MDHeading5|false}
     */
    static parse(text: string): MDHeading5 | false;
    /**
     * @param {*} input
     * @returns {MDHeading5}
     */
    static from(input: any): MDHeading5;
}
