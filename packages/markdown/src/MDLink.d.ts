import MDElement from './MDElement.js';
/**
 * Link element.
 */
export default class MDLink extends MDElement {
    /** @type {string} */
    static get defaultTag(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static get defaultEnd(): string;
    /** @type {string} */
    href: string;
    /**
     * @param {object} props
     */
    constructor(props?: object);
    toHTML(props?: {}): string;
    toString(props?: {}): string;
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
}
