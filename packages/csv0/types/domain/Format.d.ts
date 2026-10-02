/**
 * Base Format Model for CSV0 typed columns.
 */
export class Format {
    /**
     * Formats a JS value into a string representation for CSV cells.
     * @param {any} value
     * @returns {string}
     */
    stringify(value: any): string;
    /**
     * Parses a raw string from a CSV cell into native JS value.
     * @param {string} text
     * @returns {any}
     */
    parse(text: string): any;
    /**
     * Validates a value according to format constraints.
     * @param {any} value
     * @returns {boolean}
     */
    validate(value: any): boolean;
}
