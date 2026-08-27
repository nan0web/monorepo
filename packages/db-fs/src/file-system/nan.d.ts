/**
 * Loads content from a .nan file.
 * @param {string} file - Path to the .nan file.
 * @param {boolean} [softError=false] - Whether to suppress errors.
 * @returns {any} Parsed content.
 */
export declare function loadNAN(file: string, softError?: boolean): any;
/**
 * Loads content from a .nan file asynchronously.
 * @param {string} file
 * @param {boolean} softError
 * @returns {Promise<any>}
 */
export declare function loadNANAsync(file: string, softError?: boolean): Promise<any>;
/**
 * Saves data to a .nan file.
 * @param {string} file - Path to the .nan file.
 * @param {any} data - Data to save.
 * @returns {string} Saved content.
 */
export declare function saveNAN(file: string, data: any): string;
/**
 * Saves data to a .nan file asynchronously.
 * @param {string} file
 * @param {any} data
 * @returns {Promise<string>}
 */
export declare function saveNANAsync(file: string, data: any): Promise<string>;
