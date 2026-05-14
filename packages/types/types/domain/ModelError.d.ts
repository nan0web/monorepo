export default class ModelError extends Error {
    static from(str: any): ModelError;
    /**
     * @param {Record<string, any>} fields - Map of field names to their validation error messages or translation configs.
     */
    constructor(fields: Record<string, any>);
    fields: Record<string, any>;
    /**
     * Translate the error fields using a translation function.
     * @param {import('../utils/TFunction.js').TFunction} t - The translation function, e.g. t(key, params)
     * @returns {ModelError} - A new ModelError with translated fields.
     */
    translate(t: import("../utils/TFunction.js").TFunction): ModelError;
}
