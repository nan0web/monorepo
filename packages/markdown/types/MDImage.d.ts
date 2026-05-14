/**
 * Image element.
 */
export default class MDImage extends MDElement {
    static get defaultTag(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static get defaultEnd(): string;
    static parse(text: any, context?: {}): false | MDImage;
    /**
     * @param {object} props
     */
    constructor(props?: object);
    /** @type {string} */
    src: string;
    toString(props?: {}): string;
    toHTML(props?: {}): string;
}
import MDElement from './MDElement.js';
