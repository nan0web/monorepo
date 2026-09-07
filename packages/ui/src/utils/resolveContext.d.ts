/**
 * Resolves context-aware values in strings and objects.
 * Supports:
 * - References: `data:currencies`, `action:save`, `fn:calculate,100,USD,UAH`
 * - Templates: `{{user.name}}`, `{{currencies[0]}}`
 * - Scalars: numbers, booleans, etc. (passthrough)
 *
 * @param {Object} context - Application context (data, actions, functions)
 * @param {*} value - Raw value to resolve
 * @returns {*} Resolved value
 */
export function resolveContext(context: any, value: any): any;
/**
 * Resolves a context value or returns undefined if resolution fails.
 * Used internally by renderers to safely resolve props.
 *
 * @param {Object} ctx - Context with data, actions and functions
 * @param {string} value - String value to resolve
 * @returns {*} Resolved value or undefined
 */
export function resolveContextValue(ctx: any, value: string): any;
