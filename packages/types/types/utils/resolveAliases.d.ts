/**
 * Universal alias resolution for Model-as-Schema classes.
 *
 * @param {Function} Class - The class constructor with static metadata.
 * @param {object} input - Input data object.
 * @returns {object} - Processed data with aliases resolved.
 */
export default function resolveAliases(Class: Function, input: object): object;
