/**
 * Creates a Model instance from CLI argv by auto-generating parseArgs config
 * from the Model's static field descriptors.
 *
 * @template {typeof Model} T
 * @param {T} ModelClass - Model class with static field descriptors.
 * @param {string[]} argv - Raw CLI arguments (typically process.argv.slice(2)).
 * @param {Object} [appOptions={}] - Options object to inject into the Model.
 * @returns {InstanceType<T>} A fully resolved Model instance.
 */
export function modelFromArgv<T extends typeof Model>(ModelClass: T, argv?: string[], appOptions?: any): InstanceType<T>;
import { Model } from '@nan0web/types';
