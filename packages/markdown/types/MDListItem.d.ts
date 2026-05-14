/**
 * List item element.
 */
export default class MDListItem extends MDElement {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static parse(text: any): false | MDListItem;
}
import MDElement from './MDElement.js';
