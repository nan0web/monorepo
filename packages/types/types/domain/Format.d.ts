/**
 * Base Format Model for data serialization, parsing and validation.
 */
export class Format extends Model {
    /**
     * Formats a JS value into a string representation.
     * @param {any} value
     * @returns {string}
     */
    stringify(value: any): string;
    /**
     * Parses a raw string into native JS value.
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
import { Model } from './Model.js';
