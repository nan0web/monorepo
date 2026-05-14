/**
 * Link element.
 */
export default class MDLink extends MDElement {
    /** @type {string} */
    static get defaultTag(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static get defaultEnd(): string;
    /**
     *
     * @param {string} text
     * @param {{ i:number, rows:string[] }} [context]
     * @returns {MDLink|false}
     */
    static parse(text: string, context?: {
        i: number;
        rows: string[];
    }): MDLink | false;
    /**
     * @param {object} props
     */
    constructor(props?: object);
    /** @type {string} */
    href: string;
    toHTML(props?: {}): string;
    toString(props?: {}): string;
}
import MDElement from './MDElement.js';
