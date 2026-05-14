export default MDConfig;
declare class MDConfig extends MDElement {
    /**
     * Parse config from text.
     * @param {string} text
     * @param {ParseContext} context
     * @returns {MDConfig | false}
     */
    static parse(text: string, context?: ParseContext): MDConfig | false;
    /**
     * Create a config from a props object or string.
     * @param {MDConfig | object | string} props
     * @returns {MDConfig}
     */
    static from(props: MDConfig | object | string): MDConfig;
    constructor(props?: {});
    mdTag: string;
    mdEnd: string;
    tag: string;
    end: string;
    /** @type {object} */
    config: object;
    /** @type {Map<number, string>} */
    $comments: Map<number, string>;
}
import MDElement from './MDElement.js';
import ParseContext from './Parse/Context.js';
