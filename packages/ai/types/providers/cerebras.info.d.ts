declare namespace _default {
    export { makeFlat };
    export let freeModels: {
        id: string;
        object: string;
        created: number;
        owned_by: string;
    }[];
}
export default _default;
/**
 * @param {object[]} models
 * @returns {ModelInfo[]}
 */
declare function makeFlat(models: object[]): ModelInfo[];
import { ModelInfo } from '../domain/ModelInfo.js';
