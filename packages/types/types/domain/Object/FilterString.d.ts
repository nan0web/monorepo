export default FilterString;
/**
 * Extends native String with convenient filtering helpers.
 * Provides methods for checking inclusion, starting, ending, and trimming strings.
 *
 * @class FilterString
 * @extends {String}
 */
declare class FilterString extends String {
    /**
     * Check if the string includes any of the provided arguments.
     * @param {...*} args - Arguments to check for inclusion
     * @returns {boolean} True if any argument is included in the string
     */
    inIncludes(...args: any[]): boolean;
    /**
     * Check if the string starts with any of the provided arguments.
     * @param {...*} args - Arguments to check for starting match
     * @returns {boolean} True if any argument matches the start of the string
     */
    inStarts(...args: any[]): boolean;
    /**
     * Check if the string ends with any of the provided arguments.
     * @param {...*} args - Arguments to check for ending match
     * @returns {boolean} True if any argument matches the end of the string
     */
    inEnds(...args: any[]): boolean;
    /**
     * Trim specified characters from the end of the string.
     * @param {string} [chars="\n\t "] - Characters to trim from the end
     * @returns {string} String with specified characters trimmed from the end
     */
    trimEnd(chars?: string): string;
    /**
     * Trim specified characters from the start of the string.
     * @param {string} [chars="\n\t "] - Characters to trim from the start
     * @returns {string} String with specified characters trimmed from the start
     */
    trimStart(chars?: string): string;
    /**
     * Trim specified characters from both the start and end of the string.
     * @param {string} [chars="\n\t "] - Characters to trim from both ends
     * @returns {string} Trimmed string
     */
    trim(chars?: string): string;
}
