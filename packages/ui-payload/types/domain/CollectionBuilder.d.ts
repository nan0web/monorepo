/**
 * Converts an array or map of Model classes into Payload `CollectionConfig` objects.
 * @param {Array<Function>|Record<string, Function>} models
 * @param {Record<string, any>} [options={}]
 * @returns {Array<Record<string, any>>}
 */
export function buildCollectionsFromModels(models: Array<Function> | Record<string, Function>, options?: Record<string, any>): Array<Record<string, any>>;
/**
 * Runtime translator from `@nan0web/types` Model-as-Schema definitions
 * into Payload CMS `CollectionConfig` objects.
 */
export class CollectionBuilder {
    /**
     * Extracts raw field definitions from a Model class or plain schema object.
     * @param {Function|Record<string, any>} target
     * @returns {Record<string, any>}
     */
    static getSchema(target: Function | Record<string, any>): Record<string, any>;
    /**
     * Normalizes select options to Payload format.
     * @param {Array<string|{label: string, value: string}>} options
     * @returns {Array<{label: string, value: string}>}
     */
    static normalizeOptions(options: Array<string | {
        label: string;
        value: string;
    }>): Array<{
        label: string;
        value: string;
    }>;
    /**
     * Builds a single Payload field config from a Model-as-Schema field definition.
     * @param {string} name
     * @param {Record<string, any>} [def={}]
     * @param {Record<string, any>} [options={}]
     * @returns {Record<string, any>}
     */
    static buildField(name: string, def?: Record<string, any>, options?: Record<string, any>): Record<string, any>;
    /**
     * Builds Payload fields array from a Model class or schema object,
     * grouping meta fields and date range fields into `row` containers.
     * @param {Function|Record<string, any>} target
     * @param {Record<string, any>} [options={}]
     * @returns {Array<Record<string, any>>}
     */
    static buildFields(target: Function | Record<string, any>, options?: Record<string, any>): Array<Record<string, any>>;
    /**
     * Builds a Payload `CollectionConfig` from a Model class.
     * @param {Function|Record<string, any>} ModelClass
     * @param {Record<string, any>} [options={}]
     * @returns {Record<string, any>}
     */
    static buildCollection(ModelClass: Function | Record<string, any>, options?: Record<string, any>): Record<string, any>;
}
