/**
 * ──  Generic tree node that every format will start from
 * ──  { content:string, children:Array<Node> }
 */
export default class Node extends ContainerObject {
    /**
     * @param {any} input
     * @returns {Node}
     */
    static from(input: any): Node;
    /**
     * @param {Partial<Node>} [input={}]
     */
    constructor(input?: Partial<Node>);
    /** @type {string} The row content (node is a row) */
    content: string;
    /** @type {Node[]} Nested rows (with higher indents until next with the same or lower) */
    children: Node[];
    /** @type {number} The indent value */
    indent: number;
    /**
     * Adds element to the container.
     * @param {Partial<Node>} element
     * @returns {Node}
     */
    add(element: Partial<Node>): Node;
    /**
     * Updates indent for all nested children recursively.
     * @private
     */
    private _updateIndent;
    /**
     * Maps over children.
     *
     * @param {(value: Node, index: number, arr: Node[]) => any[]} callback
     * @param {boolean} [recursively=false]
     * @returns {Array}
     */
    map(callback: (value: Node, index: number, arr: Node[]) => any[], recursively?: boolean): any[];
    /**
     * @param {object} [input]
     * @param {boolean} [input.trim=false]
     * @param {string} [input.tab="\t"]
     * @param {string} [input.eol="\n"]
     * @returns
     */
    toString({ trim, tab, eol }?: {
        trim?: boolean | undefined;
        tab?: string | undefined;
        eol?: string | undefined;
    }): any;
}
import ContainerObject from '../Object/ContainerObject.js';
