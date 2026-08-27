/**
 * Loads a Markdown file with optional YAML frontmatter.
 */
declare function loadMD(file: any, softError?: boolean): any;
/**
 * Loads a Markdown file asynchronously.
 */
declare function loadMDAsync(file: any, softError?: boolean): Promise<any>;
/**
 * Parse raw Markdown string with optional YAML frontmatter.
 */
declare function parseMD(raw: any): any;
/**
 * Saves data as Markdown with YAML frontmatter.
 */
declare function saveMD(file: any, data: any): any;
/**
 * Saves data as Markdown asynchronously.
 */
declare function saveMDAsync(file: any, data: any): Promise<any>;
export { loadMD, saveMD, parseMD, loadMDAsync, saveMDAsync };
