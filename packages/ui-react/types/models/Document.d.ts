export default class Document {
    /**
     * @param {object} input
     * @returns {Document}
     */
    static from(input: object): Document;
    /**
     * @param {object} [input]
     * @param {Array<object>} [input.$content=[]]
     * @param {string} [input.$lang="en"]
     * @param {string} [input.$redirect=null]
     * @param {string} [input.$layout=null]
     * @param {string} [input.title=""]
     * @param {string} [input.description=""]
     * @param {any} [input.nav=new Navigation()]
     * @param {any} [input.t=new Map()]
     */
    constructor(input?: {
        $content?: any[] | undefined;
        $lang?: string | undefined;
        $redirect?: string | undefined;
        $layout?: string | undefined;
        title?: string | undefined;
        description?: string | undefined;
        nav?: any;
        t?: any;
    });
    /**
     * Content configuration for the document page.
     * @type {Array<Object>}
     */
    /** @type {Array<Object>} */
    $content: Array<any>;
    /** @type {string} */
    $lang: string;
    /** @type {string|null} */
    $redirect: string | null;
    /** @type {string|null} */
    $layout: string | null;
    /** @type {boolean} */
    $hideTitle: boolean;
    /** @type {string} */
    title: string;
    /** @type {string} */
    description: string;
    /** @type {Navigation} */
    nav: Navigation;
    /** @type {Map<string, string>} */
    t: Map<string, string>;
    /**
     * @param {string} type
     * @returns {Array<object>}
     */
    getBlocksByType(type: string): Array<object>;
}
import Navigation from "./Navigation.js";
