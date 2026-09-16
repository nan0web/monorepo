/**
 * Apply default values from static metadata fields to a target object.
 *
 * @param {Function} Class - The class constructor with static metadata.
 * @param {object} target - The object to apply defaults to (usually `this`).
 * @returns {object} - The target object with defaults applied.
 */
export default function resolveDefaults(Class: Function, target: object): object;
