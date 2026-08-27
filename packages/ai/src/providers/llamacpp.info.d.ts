import { ModelInfo } from '../domain/ModelInfo.js';
/**
 * Generate ModelInfo instances for local llama.cpp models
 * @param {object[]} [customModels=[]] Additional custom models
 * @returns {ModelInfo[]}
 */
declare function makeFlat(customModels?: object[]): ModelInfo[];
declare const _default: {
    makeFlat: typeof makeFlat;
    models: {
        id: string;
        name: string;
        context_length: number;
        pricing: {
            prompt: number;
            completion: number;
        };
        architecture: {
            input_modalities: string[];
            output_modalities: string[];
            tokenizer: string;
            modality: string;
        };
    }[];
};
export default _default;
