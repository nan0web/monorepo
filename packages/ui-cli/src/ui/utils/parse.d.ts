/**
 * Utility functions for parsing command‑line strings.
 *
 * @module utils/parse
 */
/**
 * Parses a string into an argv array (handles quotes).
 *
 * @param {string} str - Raw command line.
 * @returns {string[]} Tokenized arguments.
 * @throws {Error} If a quote is left unmatched.
 */
export declare function str2argv(str: string): string[];
