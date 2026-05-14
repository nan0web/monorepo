/**
 * Base class for markdown elements.
 * @typedef {Object} MDElementProps
 * @property {string} [content]
 * @property {string|Function} [tag]
 * @property {string|Function} [end]
 * @property {string|Function} [mdTag]
 * @property {string|Function} [mdEnd]
 * @property {MDElement[]} [children]
 */
export default class MDElement extends ContainerObject {
    static TAG_MARKDOWN: string;
    /** @type {string|Function} */
    static defaultMdTag: string | Function;
    /** @type {string|Function} */
    static defaultMdEnd: string | Function;
    /** @type {string|Function} */
    static defaultTag: string | Function;
    /** @type {string|Function} */
    static defaultEnd: string | Function;
    /**
     * Process content for inline elements (links, code, etc.)
     * @param {string} text
     * @param {string} [format=".md"]
     * @returns {string}
     */
    static processInline(text: string, format?: string): string;
    /**
     * Create an element from a props object or string.
     * @param {MDElement | object | string} input
     * @returns {MDElement}
     */
    static from(input: MDElement | object | string): MDElement;
    /**
     * @param {MDElementProps} props
     */
    constructor(props?: MDElementProps);
    /** @type {string} */
    content: string;
    /** @type {string|Function} */
    mdTag: string | Function;
    /** @type {string|Function} */
    mdEnd: string | Function;
    /** @type {string|Function} */
    tag: string | Function;
    /** @type {string|Function} */
    end: string | Function;
    /** @type {MDElement[]} */
    children: MDElement[];
    get empty(): boolean;
    /**
     * Returns the most recent (deepest) container.
     *
     * @returns {MDElement}
     */
    get recent(): MDElement;
    renderTag(): any;
    renderEnd(): any;
    renderMdTag(): any;
    renderMdEnd(): any;
    /**
     * Removes the element from the container.
     * @param {MDElement} element
     * @returns {this}
     */
    remove(element: MDElement): this;
    /**
     * Finds an element by filter.
     *
     * @param {(v:MDElement) => boolean} filter
     * @param {boolean} [recursively=false]
     * @returns {*}
     */
    find(filter: (v: MDElement) => boolean, recursively?: boolean): any;
    /**
     * Flattens the tree into an array.
     *
     * @returns {MDElement[]}
     */
    flat(): MDElement[];
    toArray(): MDElement[];
    /**
     * Filters children.
     *
     * @param {(v:MDElement) => boolean} [filter=()=>true]
     * @param {boolean} [recursively=false]
     * @returns {MDElement[]}
     */
    filter(filter?: (v: MDElement) => boolean, recursively?: boolean): MDElement[];
    /**
     * Maps over children.
     *
     * @param {(value: MDElement, index: number, arr: MDElement[]) => any} callback
     * @param {boolean} [recursively=false]
     * @returns {Array}
     */
    map(callback: (value: MDElement, index: number, arr: MDElement[]) => any, recursively?: boolean): any[];
    /**
     * Asynchronously maps over children.
     *
     * @param {(value: MDElement, index: number, arr: MDElement[]) => Promise<any>} callback
     * @param {boolean} [recursively=false]
     * @returns {Promise<Array>}
     */
    asyncMap(callback: (value: MDElement, index: number, arr: MDElement[]) => Promise<any>, recursively?: boolean): Promise<any[]>;
    /**
     * @throws
     * @param {MDElement} element Element to add.
     * @return {this} The current instance.
     */
    add(element: MDElement): this;
    /**
     * Convert element and children to string with indentation.
     * @param {object} props
     * @param {number} [props.indent=-2]
     * @param {string} [props.tab="  "]
     * @param {string} [props.format=".md"]
     * @returns {string}
     */
    toString(props?: {
        indent?: number | undefined;
        tab?: string | undefined;
        format?: string | undefined;
    }): string;
    /**
     * Convert element and children to HTML string with indentation.
     * @param {object} props
     * @param {number} [props.indent=0]
     * @returns {string}
     */
    toHTML(props?: {
        indent?: number | undefined;
    }): string;
    /**
     * Convert element and children to TEXT string with indentation.
     * @param {object} props
     * @param {number} [props.indent=0]
     * @param {string} [props.tag=""]
     * @param {string} [props.end=""]
     * @returns {string}
     */
    toTEXT(props?: {
        indent?: number | undefined;
        tag?: string | undefined;
        end?: string | undefined;
    }): string;
}
/**
 * Base class for markdown elements.
 */
export type MDElementProps = {
    content?: string | undefined;
    tag?: string | Function | undefined;
    end?: string | Function | undefined;
    mdTag?: string | Function | undefined;
    mdEnd?: string | Function | undefined;
    children?: MDElement[] | undefined;
};
import { ContainerObject } from '@nan0web/types';
