/**
 * Represents the default HTML tag mappings and utilities for the transformer.
 *
 * @class HTMLTags
 * @property {string} $default - The default tag to use when none is specified.
 * @property {Array<string>} $nonEmptyTags - Tags that cannot be self‑closed.
 * @property {string} $attrTrue - Placeholder for attributes without values.
 * @property {Array<string>} $singleChild - Child tags that can be collapsed when solitary.
 * @property {Object<string,string>} $tagAttrs - Mapping from shortcut symbols to real attribute names.
 * @property {string} ul - Tag to use for unordered list items.
 * @property {string} ol - Tag to use for ordered list items.
 * @property {string} dl - Tag to use for definition list terms.
 * @property {string} table - Tag to use for table rows.
 * @property {string} tr - Tag to use for table cells.
 * @property {string} select - Tag to use for select options.
 */
export default class HTMLTags {
    $default: string;
    $nonEmptyTags: string[];
    $attrTrue: string;
    /**
     * Used in xml2nano to convert elements such as `table > tbody > tr` => `table > tr`
     * if such child is a single, i.e. only `tbody`. If there are `tbody` with `thead` or
     * `tfoot` it won't remove the layer.
     *
     * @type {Array<string>}
     */
    $singleChild: Array<string>;
    /**
     * Mapping of shortcut symbols to actual HTML attribute names.
     *
     * @type {Object<string,string>}
     */
    $tagAttrs: {
        [x: string]: string;
    };
    ul: string;
    ol: string;
    dl: string;
    table: string;
    tr: string;
    select: string;
    /**
     * Returns the closing part of a tag depending on whether it belongs to
     * `$nonEmptyTags`. For tags that must contain content the method returns
     * `></tag>`; otherwise it returns `>`.
     *
     * @param {string} tag - The tag name to evaluate.
     * @returns {string} The appropriate closing string.
     */
    $selfClosed(tag: string): string;
}
