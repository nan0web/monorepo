/**
 * Horizontal rule element.
 */
export default class MDHorizontalRule extends MDElement {
    static get defaultTag(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    static get defaultEnd(): string;
    static parse(text: any): false | MDHorizontalRule;
}
import MDElement from './MDElement.js';
