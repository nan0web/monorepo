export default nano2attrs;
/**
 * Convert an attributes object to a string suitable for an XML tag.
 *
 * @param {Object<string,any>} attrs - Attribute map where keys start with `$`.
 * @param {Object<string,any>} [defaultTags={}] - Configuration allowing case overrides.
 * @returns {string} Serialized attribute string (including leading spaces).
 */
declare function nano2attrs(attrs: {
    [x: string]: any;
}, defaultTags?: {
    [x: string]: any;
}): string;
