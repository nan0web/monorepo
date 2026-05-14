/**
 * Extracts and merges static metadata from a class inheritance chain.
 * Traverses from the leaf class up to Model/Object, ensuring child overrides.
 *
 * @param {Function} Class - The class to extract metadata from.
 * @returns {Record<string, any>} - Merged metadata object.
 */
export default function getMetadata(Class: Function): Record<string, any>;
