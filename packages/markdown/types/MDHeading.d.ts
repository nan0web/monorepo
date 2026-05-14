/**
 * @typedef {Object} MDHeadingProps
 * @property {number} [heading=0]
 */
/**
 * Heading element.
 */
export default class MDHeading extends MDElement {
    /** @type {string | ((el: MDHeading) => string)} */
    static get defaultTag(): string | ((el: MDHeading) => string);
    /** @type {string | ((el: MDHeading) => string)} */
    static get defaultEnd(): string | ((el: MDHeading) => string);
    /** @type {string | ((el: MDHeading) => string)} */
    static get defaultMdTag(): string | ((el: MDHeading) => string);
    /** @type {string | ((el: MDHeading) => string)} */
    static get defaultMdEnd(): string | ((el: MDHeading) => string);
    /**
     * @param {object} input
     * @returns {MDHeading}
     */
    static from(input: object): MDHeading;
    /**
     * Parses a heading from markdown text.
     * @param {string} text
     * @returns {MDHeading|false}
     */
    static parse(text: string): MDHeading | false;
    /**
     *
     * @param {import("./MDElement.js").MDElementProps & MDHeadingProps} [props]
     */
    constructor(props?: import("./MDElement.js").MDElementProps & MDHeadingProps);
    /** @type {number} */
    heading: number;
}
export type MDHeadingProps = {
    heading?: number | undefined;
};
import MDElement from './MDElement.js';
