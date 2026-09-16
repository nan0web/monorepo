/**
 * Convert Payload Lexical state (or root node) back into a NaN0HTML AST.
 * @param {Object} lexicalState Lexical state object `{ root: { children: [...] } }` or node object
 * @returns {any} NaN0HTML AST structure (Array, Object, or String)
 */
export function toNan0Html(lexicalState: any): any;
export default toNan0Html;
