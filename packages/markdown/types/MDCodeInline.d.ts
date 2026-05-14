/**
 * Inline code element.
 */
export default class MDCodeInline extends MDElement {
    /** @type {string} */
    static get defaultTag(): string;
    /** @type {string} */
    static get defaultMdTag(): string;
    /** @type {string} */
    static get defaultMdEnd(): string;
    /** @type {string} */
    static get defaultEnd(): string;
    /**
     * @param {string} text
     * @param {object} context
     * @returns {MDCodeInline|false}
     */
    static parse(text: string, context?: object): MDCodeInline | false;
}
import MDElement from './MDElement.js';
