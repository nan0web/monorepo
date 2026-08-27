import MDElement from './MDElement.js';
export type MDElementProps = import("./MDElement.js").MDElementProps;
export type MDCodeBlockProps = {
    language?: string;
};
/** @typedef {import("./MDElement.js").MDElementProps} MDElementProps */
/**
 * Code block element.
 * @typedef {Object} MDCodeBlockProps
 * @property {string} [language]
 */
export default class MDCodeBlock extends MDElement {
    /** @type {((el: MDCodeBlock) => string)} */
    static get defaultTag(): ((el: MDCodeBlock) => string);
    /** @type {((el: MDCodeBlock) => string)} */
    static get defaultMdTag(): ((el: MDCodeBlock) => string);
    /** @type {string} */
    static get defaultMdEnd(): string;
    /** @type {((el: MDCodeBlock) => string)} */
    static get defaultEnd(): ((el: MDCodeBlock) => string);
    /** @type {string} */
    language: string;
    /**
     * @param {MDCodeBlockProps & MDElementProps} props
     */
    constructor(props?: MDCodeBlockProps & MDElementProps);
    /**
     * Parses a code block from markdown text.
     * @param {string} text
     * @param {{i?: number, rows?: string[]}} context
     * @returns {MDCodeBlock|false}
     */
    static parse(text: string, context?: {
        i?: number;
        rows?: string[];
    }): MDCodeBlock | false;
}
