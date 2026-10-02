/**
 * StringFormat - default string representation.
 */
export class StringFormat extends Format {
    /**
     * @param {string} text
     * @returns {string}
     */
    parse(text: string): string;
}
import { Format } from '../Format.js';
