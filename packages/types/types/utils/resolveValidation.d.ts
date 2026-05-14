/**
 * Validate values of a target object against static metadata rules.
 *
 * @param {Function} Class - The class constructor with static metadata fields.
 * @param {object} target - The object whose properties should be validated.
 * @returns {boolean} - Returns true if validation passes.
 * @throws {ModelError} - Throws a ModelError with all validation failures.
 */
export default function resolveValidation(Class: Function, target: object): boolean;
