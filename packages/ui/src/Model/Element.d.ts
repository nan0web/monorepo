/**
 * @file Element — the model of a declarative UI block.
 * Format: { Button: [...], $variant: 'info', $onClick: fn }
 * Framework-agnostic.
 */
export default class Element {
    /** @type {Record<string, string | ((val: any, key: string) => Record<string, any>)>} */
    static PROP_ALIASES: Record<string, string | ((val: any, key: string) => Record<string, any>)>;
    /**
     * Factory method to create or return an existing `Element`.
     * @param {Object} input
     * @returns {Element}
     */
    static from(input: any): Element;
    /**
     * Parses $-props.
     * Converts for example:
     *   - $style="color:red;font-size:14px" → { style: { color: 'red', 'font-size': '14px' } }
     *   - $onClick=fn → { onClick: fn }
     *   - $ariaHidden=true → { 'aria-hidden': true }
     *
     * @param {string} key - The name of the prop
     * @param {any} value - The value of the prop
     * @returns {Object} - An object { propName: newVal }
     */
    static parseProp(key: string, value: any): any;
    /**
     * Parses an inline CSS style string.
     * @param {string} styleStr
     * @returns {Object}
     */
    static parseInlineStyle(styleStr: string): any;
    /**
     * Extracts $-props from the block.
     * @param {Object} block
     * @param {boolean} keep$ - Whether to keep the prefix `$`.
     * @param {Function} [flatMap] - Function that transforms a key-value pair into a new key-value pair.
     * @returns {Object}
     */
    static extractProps(block: any, keep$?: boolean, flatMap?: Function): any;
    /**
     * Extracts tags (non-prefixed keys) from the block.
     * @param {Object} block
     * @returns {Array<[string, any]>}
     */
    static extractTags(block: any): Array<[string, any]>;
    /**
     * Creates an `Element` from a declarative block.
     * @param {Object} input - For example, { Button: ["Click"], $variant: "primary" }
     */
    constructor(input?: any);
    /**
     * The component type or HTML tag (e.g., "Button", "div")
     * @type {string}
     */
    type: string;
    /**
     * The content of the element.
     * Can be:
     *   - string → text
     *   - true → empty
     *   - array → nested blocks { Icon } or text nodes
     * @type {string | true | any[]}
     */
    content: string | true | any[];
    /**
     * Props extracted from $-keys.
     * For example, { $onClick: fn, $variant: 'info' } → { onClick: fn, variant: 'info' }
     * @type {Object}
     */
    props: any;
    /**
     * Checks if the element contains nested elements (not only text).
     * @returns {boolean}
     */
    hasChildren(): boolean;
    /**
     * Checks if the content contains text fragments.
     * @returns {boolean}
     */
    hasText(): boolean;
    /**
     * Returns an array of child elements (Element instances).
     * @returns {Element[]}
     */
    getChildElements(): Element[];
}
