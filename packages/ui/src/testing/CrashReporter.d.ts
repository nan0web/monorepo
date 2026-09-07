/**
 * @file CrashReporter.js — Nan0Spec serialization.
 */
/**
 * Transforms an execution trace from GeneratorRunner into a strict Nan0Spec model
 * ready to be saved as a .nan0 file for Crash Reporting and Integration Tests.
 *
 * @param {string} appName The name of the root model/app (e.g. 'ShoppingCartApp').
 * @param {object} appData The initial data provided to the app.
 * @param {import('../core/Intent.js').Intent[]} trace The array of intents executed.
 * @returns {Array<object>} The serializable Nan0Spec array.
 */
export function buildNan0SpecFromTrace(appName: string, appData: object, trace: import("../core/Intent.js").Intent[]): Array<object>;
