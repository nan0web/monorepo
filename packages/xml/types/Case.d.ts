export default Case;
/**
 * Utility class providing case transformation methods.
 * @class
 */
declare class Case {
    /** @type {string} */
    static CAMEL: string;
    /** @type {string} */
    static KEBAB: string;
    /** @type {string} */
    static SNAKE: string;
    /** @type {string} */
    static PASCAL: string;
    /** @type {string} */
    static UPPER: string;
    /** @type {string} */
    static LOWER: string;
    /**
     * Convert a string to camelCase.
     * @param {string} str - Input string.
     * @returns {string} Camel‑cased string.
     */
    static toCamelCase(str: string): string;
    /**
     * Convert a string to kebab-case.
     * @param {string} str - Input string.
     * @returns {string} Kebab‑cased string.
     */
    static toKebabCase(str: string): string;
    /**
     * Convert a string to snake_case.
     * @param {string} str - Input string.
     * @returns {string} Snake‑cased string.
     */
    static toSnakeCase(str: string): string;
    /**
     * Convert a string to PascalCase.
     * @param {string} str - Input string.
     * @returns {string} Pascal‑cased string.
     */
    static toPascalCase(str: string): string;
    /**
     * Convert a string to UPPERCASE.
     * @param {string} str - Input string.
     * @returns {string} Upper‑cased string.
     */
    static toUpperCase(str: string): string;
    /**
     * Convert a string to lowercase.
     * @param {string} str - Input string.
     * @returns {string} Lower‑cased string.
     */
    static toLowerCase(str: string): string;
    /**
     * Transform a string according to the requested case type.
     * @param {string} str - Input string.
     * @param {string} type - One of the {@link Case} static constants.
     * @returns {string} Transformed string; returns original if type is unknown.
     */
    static transform(str: string, type: string): string;
}
