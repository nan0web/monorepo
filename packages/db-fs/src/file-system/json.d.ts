/**
 * Parses JSON string.
 */
declare function fromJSON(str: any): any;
/**
 * Loads and parses JSON file.
 */
declare function loadJSON(file: any, softError?: boolean): any;
/**
 * Loads and parses JSON file asynchronously.
 */
declare function loadJSONAsync(file: any, softError?: boolean): Promise<any>;
/**
 * Stringifies data to JSON with Map support.
 */
declare function toJSON(data: any, replacer?: null, space?: number): string;
/**
 * Saves data as JSON file.
 */
declare function saveJSON(file: any, data: any, replacer?: null, space?: number): string;
/**
 * Saves data as JSON file asynchronously.
 */
declare function saveJSONAsync(file: any, data: any, replacer?: null, space?: number): Promise<string>;
export { loadJSON, saveJSON, fromJSON, toJSON, loadJSONAsync, saveJSONAsync };
