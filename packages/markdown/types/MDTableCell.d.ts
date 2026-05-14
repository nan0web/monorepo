/**
 * Table cell element.
 */
export default class MDTableCell extends MDElement {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static parse(text: any, context?: {}): false | MDTableCell;
}
import MDElement from './MDElement.js';
