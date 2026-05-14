/**
 * Class representing an HTML transformer.
 *
 * Encodes nano objects to HTML format, and decodes HTML strings to nano objects.
 *
 * @class HTMLTransformer
 * @extends XMLTransformer
 */
export default class HTMLTransformer extends XMLTransformer {
    /**
     * Creates a new HTMLTransformer instance.
     *
     * @param {Object} [options={}]
     * @param {string} [options.tab='\t'] - Indentation string.
     * @param {string} [options.eol='\n'] - End‑of‑line string.
     * @param {HTMLTags} [options.defaultTags] - Tag mapping configuration.
     */
    constructor(options?: {
        tab?: string | undefined;
        eol?: string | undefined;
        defaultTags?: HTMLTags | undefined;
    } | undefined);
    /**
     * Decodes an HTML string to a nano object.
     *
     * Currently not implemented.
     *
     * @param {string} str - HTML string.
     * @throws {Error} Always throws as the method is a placeholder.
     */
    decode(str: string): Promise<void>;
}
import XMLTransformer from '@nan0web/xml';
import HTMLTags from './HTMLTags.js';
