/**
 * Class representing an XML transformer.
 * Encodes nan•objects to XML format, and decodes XML strings to nan•objects.
 * @extends Transformer
 */
export default class XMLTransformer extends Transformer {
    /**
     * Creates a new XMLTransformer instance.
     * @param {Object} [options={}] - Options for XML conversion.
     * @param {string} [options.tab='\t'] - The string to use for indentation.
     * @param {string} [options.eol='\n'] - The string to use for new lines.
     * @param {XMLTags} [options.defaultTags] - The default tag mappings for conversion.
     */
    constructor(options?: {
        tab?: string | undefined;
        eol?: string | undefined;
        defaultTags?: XMLTags | undefined;
    });
    /** @type {string} */
    tab: string;
    /** @type {string} */
    eol: string;
    /** @type {XMLTags} */
    defaultTags: XMLTags;
    /**
     * Encodes a nan•object to XML format.
     * @param {Object|Array} data - The nan•object or array to encode.
     * @returns {Promise<string>} - The XML string representation.
     */
    encode(data: any | any[]): Promise<string>;
    /**
     * Decodes an XML string to a nan•object.
     * @param {string} str - The XML string to decode.
     * @returns {Promise<Object|Array>} - The decoded nan•object or array.
     */
    decode(str: string): Promise<any | any[]>;
}
import Transformer from '@nan0web/transformer';
import XMLTags from './XMLTags.js';
