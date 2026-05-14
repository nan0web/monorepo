export default xml2nano;
/**
 * Parse an XML string into a nan•style JavaScript object.
 * This is the inverse of nano2xml().
 * Zero external dependencies — pure RegExp-based tokenizer.
 *
 * @param {string} xmlStr - The XML string to parse.
 * @returns {Object} The nan•style JavaScript object.
 */
declare function xml2nano(xmlStr: string): any;
