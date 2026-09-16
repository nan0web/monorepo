/**
 * Recursively walk the NaN0HTML AST and collect unknown constructs.
 * @param {any} node
 * @param {Array<{tag: string, attributes: Object, parent: string}>} out
 * @param {string} parent
 */
export function inventoryNan0Html(node: any, out?: Array<{
    tag: string;
    attributes: any;
    parent: string;
}>, parent?: string): {
    tag: string;
    attributes: any;
    parent: string;
}[];
/**
 * Convert a NaN0HTML AST into a Payload Lexical root state.
 * @param {any} content NaN0HTML AST (array of blocks, or a single block)
 * @returns {{ root: { type: string, version: number, children: any[] } }}
 */
export function fromNan0Html(content: any): {
    root: {
        type: string;
        version: number;
        children: any[];
    };
};
/**
 * fromNan0Html
 * Converts a NaN0HTML AST (page.content / content) into a Payload Lexical state JSON.
 *
 * NaN0HTML AST shape:
 *   - array       → sequence of blocks
 *   - string      → text content
 *   - object      → element with keys: `$attr` for attributes, lowercase tag keys for
 *                   child elements, `Uppercase.With.Dot` keys for NaN0 components
 *   - `tag: true` → void element (e.g. `br`, `hr`)
 *
 * Strategy:
 *   - Clean elements (no attributes) map to native Lexical nodes where possible.
 *   - Elements carrying any `$`-attribute are preserved losslessly as a `nan0-element`
 *     node (tag + attributes + children) so round-trip back to NaN0HTML is lossless.
 *   - Unknown tags fall back to a `nan0-raw` node and are recorded in the inventory.
 *   - NaN0 components (`App.Header`, `Card.Details`, ...) become `nan0-component` nodes.
 *
 * The converter returns a plain structure; localization is handled at the Payload
 * collection level, not here.
 */
export const FORMAT: Readonly<{
    bold: number;
    italic: number;
    underline: number;
    strikethrough: number;
}>;
export default fromNan0Html;
