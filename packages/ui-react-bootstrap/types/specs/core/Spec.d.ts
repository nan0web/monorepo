/**
 * Base spec class for validation and configuration.
 */
export default class Spec {
    /**
     * @param {Object} input - Input object
     * @returns {Spec}
     */
    static from(input: any): Spec;
    toJson(): this;
}
