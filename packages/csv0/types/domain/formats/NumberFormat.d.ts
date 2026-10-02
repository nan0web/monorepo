/**
 * NumberFormat - numeric representation.
 */
export class NumberFormat extends Format {
    /**
     * @param {string} text
     * @returns {number | null}
     */
    parse(text: string): number | null;
}
import { Format } from '../Format.js';
