import MDElement from './MDElement.js';
/**
 * Space element for representing empty lines or whitespace blocks.
 */
export default class MDSpace extends MDElement {
    content: any;
    constructor(props?: {});
    toHTML(): string;
    /**
     * @param {string} text
     * @param {{i?: number, rows?: string[]}} [context={}]
     * @returns {MDSpace|false}
     */
    static parse(text: string, context?: {
        i?: number;
        rows?: string[];
    }): MDSpace | false;
}
