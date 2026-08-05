/**
 * @typedef {Object} AutoHydrated
 * @property {Object} [parent] The parent document.
 * @property {string[]} [auto] The auto field-value mapping from the parent document.
 * @property {string} [$auto] The name of the auto field-value mapping config in the document.
 */
/** @typedef {Partial<import('@nan0web/types').ModelOptions> & AutoHydrated} HydratedModelOptions */
/**
 * HydratedModel
 * Extends base Model to support Model-as-App features:
 * 1. Unminifies properties based on parent document's $index.fields.
 * 2. Resolves Late-Bound string references (e.g., "$files") from parent document.
 * 3. Preserves explicit overrides (e.g. []) while auto-hydrating omitted/undefined/null properties.
 */
export class HydratedModel extends Model {
    /**
     * @param {Object} [input]
     * @param {HydratedModelOptions} [options]
     */
    constructor(input?: any, options?: HydratedModelOptions);
}
export type AutoHydrated = {
    /**
     * The parent document.
     */
    parent?: any;
    /**
     * The auto field-value mapping from the parent document.
     */
    auto?: string[] | undefined;
    /**
     * The name of the auto field-value mapping config in the document.
     */
    $auto?: string | undefined;
};
export type HydratedModelOptions = Partial<import("@nan0web/types").ModelOptions> & AutoHydrated;
import { Model } from '@nan0web/types';
