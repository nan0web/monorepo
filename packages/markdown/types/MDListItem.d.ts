/**
 * List item element.
 */
export default class MDListItem extends MDElement {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static parse(text: any): false | MDListItem;
    constructor(props?: {});
    /** @type {string | null} */
    status: string | null;
    /** @type {Record<string, string>} */
    badges: Record<string, string>;
    /**
     * Render markdown string.
     * @param {object} props
     * @returns {string}
     */
    toString(props?: object): string;
}
import MDElement from './MDElement.js';
