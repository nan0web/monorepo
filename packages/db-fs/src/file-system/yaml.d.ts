/**
 * Loads and parses YAML file.
 * @function
 * @param {string} file - Path to YAML file.
 * @param {boolean} [softError=false] - Suppress errors.
 * @returns {*} Parsed YAML content.
 * @throws {Error} If parsing fails and softError is false.
 */
declare function loadYAML(file: string, softError?: boolean): any;
/**
 * Loads and parses YAML file asynchronously.
 * @param {string} file
 * @param {boolean} softError
 * @returns {Promise<any>}
 */
declare function loadYAMLAsync(file: string, softError?: boolean): Promise<any>;
/**
 * Saves data as YAML file.
 * @function
 * @param {string} file - Path to save YAML.
 * @param {*} data - Data to save.
 * @returns {string} Stringified YAML.
 */
declare function saveYAML(file: string, data: any): string;
/**
 * Saves data as YAML file asynchronously.
 * @param {string} file
 * @param {any} data
 * @returns {Promise<string>}
 */
declare function saveYAMLAsync(file: string, data: any): Promise<string>;
export { loadYAML, saveYAML, loadYAMLAsync, saveYAMLAsync };
