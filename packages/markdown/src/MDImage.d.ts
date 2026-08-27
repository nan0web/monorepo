import MDElement from './MDElement.js';
/**
 * Image element.
 */
export default class MDImage extends MDElement {
    static get defaultTag(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static get defaultEnd(): string;
    /** @type {string} */
    src: string;
    /**
     * @param {object} props
     */
    constructor(props?: object);
    toString(props?: {}): string;
    toHTML(props?: {}): string;
    static parse(text: any, context?: {}): false | MDImage;
}
