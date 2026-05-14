/**
 * Paragraph element.
 */
export default class MDParagraph extends MDElement {
    static get defaultTag(): string;
    static get defaultEnd(): string;
    static get defaultMdTag(): string;
    static get defaultMdEnd(): string;
    /**
     * @param {string} text
     * @param {ParseContext} [context={}]
     * @returns {MDParagraph|false}
     */
    static parse(text: string, context?: ParseContext): MDParagraph | false;
    /**
     * Override toString to handle inline elements properly
     * @param {object} props
     * @param {number} [props.indent=0]
     * @param {string} [props.format=".md"]
     * @returns {string}
     */
    toString(props?: {
        indent?: number | undefined;
        format?: string | undefined;
    }): string;
}
import MDElement from './MDElement.js';
import ParseContext from './Parse/Context.js';
