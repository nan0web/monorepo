/**
 * Parses a CSV0 string.
 * CSV0 is a CSV format with FrontMatter (YAML/nan0 format), separated by `---`.
 *
 * @param {string} source - The raw string content of a .csv0 file
 * @returns {{ frontMatter: string, csvBody: string }}
 */
export function parseCSV0(source: string): {
    frontMatter: string;
    csvBody: string;
};
