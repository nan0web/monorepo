/**
 * BooleanFormat - compact 0/1 serialization for boolean values.
 */
export class BooleanFormat extends Format {
    static UI: {
        invalidBoolean: string;
    };
    /**
     * @param {string} text
     * @returns {boolean}
     */
    parse(text: string): boolean;
}
import { Format } from '../Format.js';
