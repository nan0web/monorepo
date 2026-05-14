/**
 * Zero-Hallucination Parser
 * Removes markdown tags and JS-style comments from LLM-generated JSON strings.
 *
 * @param {string} raw
 * @returns {any}
 * @throws {Error} if JSON parsing still fails after cleaning.
 */
export function cleanAndParseJSON(raw: string): any;
