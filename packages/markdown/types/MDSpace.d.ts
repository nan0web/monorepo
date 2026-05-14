/**
 * Space element for representing empty lines or whitespace blocks.
 */
export default class MDSpace extends MDElement {
    /**
     * @param {string} text
     * @param {{i?: number, rows?: string[]}} [context={}]
     * @returns {MDSpace|false}
     */
    static parse(text: string, context?: {
        i?: number;
        rows?: string[];
    }): MDSpace | false;
    constructor(props?: {});
    content: any;
    toHTML(): string;
}
import MDElement from './MDElement.js';
