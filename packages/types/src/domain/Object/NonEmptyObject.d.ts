export default NonEmptyObject;
/**
 * Base class providing a `toObject` method that omits empty values.
 *
 * @class NonEmptyObject
 */
declare class NonEmptyObject {
    /**
     * Convert instance properties to a plain object, skipping empty values.
     *
     * @returns {Object} Plain object representation
     */
    toObject(): any;
}
