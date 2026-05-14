/**
 * Blockquote element.
 */
export default class MDBlockquote extends MDElement {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static parse(text: any, context?: {}): false | MDBlockquote;
    toString(props?: {}): string;
}
import MDElement from './MDElement.js';
