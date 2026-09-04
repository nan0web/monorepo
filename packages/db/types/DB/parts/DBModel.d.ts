/**
 * Model hydration and validation layer for the database.
 * Handles model registration, data hydration, and schema validation.
 * Extends DBFetch to add model-level operations.
 *
 * @class
 * @extends {DBFetch}
 */
export default class DBModel extends DBFetch {
    /**
     * Finds the registered Model for a given URI using longest-prefix matching.
     * @param {string} uri
     * @returns {Function | null}
     */
    _findModel(uri: string): Function | null;
    /**
     * Hydrates raw data through the registered Model.
     * Tries Model.from(data) first, then new Model(data).
     * @param {any} data
     * @param {any} ModelClass
     * @returns {any}
     */
    _hydrate(data: any, ModelClass: any): any;
    /**
     * Validates data against the registered Model schema.
     * Model static fields with `{ help, default }` shape are treated as schema.
     * Returns an object with `valid` boolean and `errors` array.
     *
     * @param {string} uri - Document URI to find the matching Model
     * @param {any} [data] - Data to validate (if omitted, fetches from storage)
     * @returns {Promise<{ valid: boolean, errors: Array<{ field: string, message: string }> }>}
     */
    validate(uri: string, data?: any): Promise<{
        valid: boolean;
        errors: Array<{
            field: string;
            message: string;
        }>;
    }>;
}
import DBFetch from './DBFetch.js';
