import MDElement from './MDElement.js';
import MDCodeBlock from './MDCodeBlock.js';
import MDCodeInline from './MDCodeInline.js';
import MDSpace from './MDSpace.js';
import InterceptorInput from './InterceptorInput.js';
/**
 * Markdown parser for nanoweb.
 * Parses markdown to object by new lines.
 * @link https://www.markdownguide.org/cheat-sheet/
 */
export default class Markdown {
    static ELEMENTS: (typeof MDCodeInline | typeof MDCodeBlock | typeof MDSpace)[];
    /** @type {MDElement} */
    document: MDElement;
    /** @type {'yaml' | 'nan0'} */
    frontmatterFormat: 'yaml' | 'nan0';
    /** @type {Record<string, any>} */
    vars: Record<string, any>;
    /**
     * @param {Partial<Markdown> | string} [input]
     */
    constructor(input?: Partial<Markdown> | string);
    /**
     * Parses optional frontmatter block.
     * @param {string} raw
     * @returns {{ content: string, metadata: Record<string, any> }}
     */
    parseFrontmatter(raw: string): {
        content: string;
        metadata: Record<string, any>;
    };
    /**
     * Proxies to document.add()
     * @param {MDElement} element
     * @returns {this}
     */
    add(element: MDElement): this;
    /**
     * Writes content to the document.
     * @param {string} content
     * @param {string|Function} [tag='p'] - MD element tag or type
     * @returns {this}
     */
    write(content: string, tag?: string | Function): this;
    /**
     * Writes a table to the document.
     * @param {Array<Object|Array<string|number>>} data - Tabular data
     * @returns {this}
     */
    table(data: Array<any | Array<string | number>>): this;
    /** @type {string} */
    get content(): string;
    set content(value: string);
    /**
     * Returns markdown string representation.
     * @returns {string}
     */
    toString(): string;
    /**
     * Parse markdown text into elements.
     * @param {string} text
     * @returns {MDElement[]} - Root element children
     */
    parse(text: string): MDElement[];
    /**
     * Parse markdown text into elements.
     * @param {string} text
     * @returns {MDElement[]} - Root element children
     */
    static parse(text: string): MDElement[];
    /**
     * Stringify elements to HTML string.
     * @param {(element: InterceptorInput) => string | null} [interceptor]
     * @returns {string}
     */
    stringify(interceptor?: (element: InterceptorInput) => string | null): string;
    /**
     * Stringify elements to HTML string.
     * @param {(element: InterceptorInput) => Promise<string | null>} [interceptor]
     * @returns {Promise<string>}
     */
    asyncStringify(interceptor?: (element: InterceptorInput) => Promise<string | null>): Promise<string>;
    /**
     * Convert element to HTML string.
     * @param {MDElement} el
     * @returns {string}
     */
    elementToHTML(el: MDElement): string;
}
