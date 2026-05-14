/**
 * Table row element.
 */
export default class MDTableRow extends MDElement {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static parse(text: any): false | MDTableRow;
    toString(props?: {}): string;
}
import MDElement from './MDElement.js';
