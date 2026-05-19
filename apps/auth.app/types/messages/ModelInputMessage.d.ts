/**
 * ModelInputMessage - Base class merging @nan0web/types Model (Model-as-Schema)
 * with @nan0web/co InputMessage interface.
 *
 * It maps all schema properties directly to the instance, while providing
 * a `body` getter returning `this` for backward compatibility.
 */
export default class ModelInputMessage extends Model {
    /**
     * Polymorphic static from builder
     * @param {any} input
     * @returns {ModelInputMessage}
     */
    static from(input: any): ModelInputMessage;
    constructor(data?: {}, options?: {});
    /** @type {string[]} */
    options: string[];
    /** @type {boolean} */
    waiting: boolean;
    /** @type {Record<string, any>} */
    head: Record<string, any>;
    /** @type {Date} */
    time: Date;
    /**
     * Backward compatibility helper for legacy code expecting message.body
     * @returns {this}
     */
    get body(): this;
    /**
     * Validation check using resolveValidation
     * @returns {boolean}
     */
    get isValid(): boolean;
    /**
     * Gathers error strings from validation failures
     * @returns {Array<string|Array<string, any>>}
     */
    get errors(): Array<string | Array<string, any>>;
}
import { Model } from '@nan0web/types';
