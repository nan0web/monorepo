import { Parser, Node } from '@nan0web/types';
declare class DocsParser extends Parser {
    #private;
    static SKIP: any[];
    stops: string[];
    /**
     * @param {object} input
     * @param {string} [input.eol="\n"]
     * @param {string} [input.tab="  "]
     * @param {Array<string | Function>} [input.skip=[]]
     */
    constructor(input?: {
        eol?: string;
        tab?: string;
        skip?: Array<string | Function>;
    });
    /**
     * @param {Function | string} text
     * @returns {Node}
     */
    decode(text: Function | string): Node;
    /**
     * Parsing comments properly by detecting the another indent count inside the comment
     * Indentation calculator.
     * Returns how many *tab‑units* (default two spaces) the line starts with.
     * @param {string} str
     * @param {string[]} [prevRows=[]]
     * @returns {number}
     */
    readIndent(str: string, prevRows?: string[]): number;
}
export default DocsParser;
