/**
 * @typedef {Object} ModelOptions
 * @property {import('@nan0web/db').default | null | undefined} db Database instance or access provider
 * @property {Record<string, any>} plugins Optional plugins/extensions
 * @property {import('../utils/TFunction.js').TFunction} t Translation function
 */
/**
 * Domain Data Model
 * Implements Model-as-Schema (Project-as-Data)
 *
 * Basic model implementing resolveDefaults, resolveAliases та resolveValidation.
 *
 * @example
 * import { Model } from '@nan0web/types'
 * const model = new Model({ description: 'My App', tags: ['ui'] })
 */
export class Model {
    /**
     * @param {object | string} [data] Model's data (nan0, yaml, md-frontmatter, etc.)
     * @param {Partial<ModelOptions>} [options] Extended options `db`, `t`, `plugins`.
     */
    constructor(data?: object | string, options?: Partial<ModelOptions>);
    /** @type {ModelOptions} Environment options dependencies. */
    _: ModelOptions;
    /**
     * Validate instance against static schema metadata.
     * @returns {boolean} True if validation passes
     * @throws {import('./ModelError.js').ModelError}
     */
    validate(): boolean;
    /**
     * Update instance data with alias resolution support.
     * @param {object} data
     * @returns {this}
     */
    setData(data: object): this;
}
export type ModelOptions = {
    /**
     * Database instance or access provider
     */
    db: import("@nan0web/db").default | null | undefined;
    /**
     * Optional plugins/extensions
     */
    plugins: Record<string, any>;
    /**
     * Translation function
     */
    t: import("../utils/TFunction.js").TFunction;
};
