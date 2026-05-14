/**
 * Simple container for default XML tag names and a helper to close tags.
 * @class
 */
export default class XMLTags {
    /** @type {string} */
    $default: string;
    /** @type {string} */
    books: string;
    /** @type {string} */
    library: string;
    /** @type {string} */
    catalog: string;
    /** @type {string} */
    employees: string;
    /** @type {string} */
    department: string;
    /**
     * Return a closing string for a tag.
     * If the tag starts with a question mark it is treated as a processing
     * instruction and closed with `?>`, otherwise a normal closing tag is used.
     * @param {string} tag - Tag name.
     * @returns {string} Closing string.
     */
    $selfClosed(tag: string): string;
}
