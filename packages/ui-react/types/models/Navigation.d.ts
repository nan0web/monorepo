export default Navigation;
declare class Navigation extends ContainerObject {
    /**
     * @param {object} input
     * @returns {Navigation}
     */
    static from(input?: object): Navigation;
    /**
     * @param {object} input
     * @param {string} [input.href]
     * @param {string} [input.img]
     * @param {string} [input.icon]
     * @param {string} [input.title]
     * @param {string} [input.$class]
     * @param {boolean} [input.disabled=false]
     * @param {Navigation[]} [input.children]
     */
    constructor(input?: {
        href?: string | undefined;
        img?: string | undefined;
        icon?: string | undefined;
        title?: string | undefined;
        $class?: string | undefined;
        disabled?: boolean | undefined;
        children?: Navigation[] | undefined;
    });
    /** @type {string} */
    href: string;
    /** @type {string} */
    title: string;
    /** @type {string} */
    img: string;
    /** @type {string} */
    icon: string;
    /** @type {string} */
    $class: string;
    /** @type {boolean} */
    disabled: boolean;
    /** @type {Navigation[]} */
    children: Navigation[];
    /**
     * @returns {string}
     */
    get url(): string;
    /**
     * @returns {boolean}
     */
    get empty(): boolean;
    /**
     * @returns {number}
     */
    get count(): number;
    /**
     * Checks if the current navigation item's href matches the given URI or is a parent folder of the URI.
     * @param {string} uri - The URI to check against the navigation item's href.
     * @returns {boolean} - `true` if the navigation item's href matches the URI or is a parent folder, otherwise `false`.
     */
    isActive(uri: string): boolean;
    /**
     * @param {string} uri
     * @returns {Navigation | null}
     */
    get(uri: string): Navigation | null;
    /**
     * @param {string | URL} to
     */
    isExternal(to: string | URL): any;
}
import { ContainerObject } from "@nan0web/types";
