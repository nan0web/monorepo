/**
 * List element.
 */
export default class MDList extends MDElement {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * Parse a list block from markdown.
     * @param {string} text
     * @param {{i:number, rows:string[]}} context
     * @returns {MDList|false}
     */
    static parse(text: string, context?: {
        i: number;
        rows: string[];
    }): MDList | false;
    constructor(props?: {});
    /** @type {boolean} */
    ordered: boolean;
    /**
     * Add an element or raw string to the list.
     * @param {MDElement | string} element
     * @returns {this}
     */
    add(element: MDElement | string): this;
    /**
     * Render the list as markdown.
     * The list container itself does not emit a line; each child item
     * renders its own markdown prefix (e.g., "- " or "1.").
     * @param {object} props
     * @param {number} [props.indent=0]
     * @param {string} [props.format=".md"]
     * @returns {string}
     */
    toString(props?: {
        indent?: number | undefined;
        format?: string | undefined;
    }): string;
}
import MDElement from './MDElement.js';
