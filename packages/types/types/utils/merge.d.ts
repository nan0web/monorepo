/**
 * Deep merge utility with support for `$clear` flag and unique array merging.
 *
 * @param {any} target - Original value (object, array or primitive).
 * @param {any} source - Value to merge into target.
 * @param {Object} [options] - Configuration options.
 * @param {boolean} [options.unique=true] - When true arrays are merged uniquely.
 * @returns {any} Merged result.
 *
 * @example
 * const result = merge({ arr: [1, 2] }, [{ $clear: true }, 3, 4])
 * // result => { arr: [3, 4] }
 */
export default function merge(target: any, source: any, options?: {
    unique?: boolean | undefined;
}): any;
/**
 * Return a new array with duplicate items removed.
 * Equality is performed via JSON.stringify (sufficient for current tests).
 *
 * @param {Array} arr
 * @returns {Array}
 */
export function uniqArray(arr: any[]): any[];
