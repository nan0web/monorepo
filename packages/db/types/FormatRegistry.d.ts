/**
 * Registry for database document serialization formats.
 * Supports both global and instance-level format registrations.
 */
export default class FormatRegistry {
    /** @type {FormatRegistry} */
    static default: FormatRegistry;
    /**
     * Registers loader and saver functions for a specific extension.
     * @param {string} ext - Extension, e.g., '.yaml' or '.md'
     * @param {(str: string, ext: string) => any} loader
     * @param {(doc: any, ext: string) => string} saver
     */
    register(ext: string, loader: (str: string, ext: string) => any, saver: (doc: any, ext: string) => string): void;
    /**
     * Resolves loader for given extension. Falls back to raw string.
     * @param {string} ext
     * @returns {(str: string, ext: string) => any}
     */
    resolveLoader(ext: string): (str: string, ext: string) => any;
    /**
     * Resolves saver for given extension. Falls back to string coercion.
     * @param {string} ext
     * @returns {(doc: any, ext: string) => string}
     */
    resolveSaver(ext: string): (doc: any, ext: string) => string;
    #private;
}
