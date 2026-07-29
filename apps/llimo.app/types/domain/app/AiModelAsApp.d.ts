/**
 * Contract for the injected AI Engine
 * @typedef {Object} AIEngineContract
 * @property {import('../../llm/ModelInfo.js').ModelInfo | null} selectedModel The currently selected AI model
 * @property {function(string): import('../../llm/ModelInfo.js').ModelInfo | undefined} getModel Get a model by ID
 * @property {function(string): import('../../llm/ModelInfo.js').ModelInfo | undefined} findModel Find a model by partial ID
 * @property {function(string, any[], any=): import('ai').StreamTextResult<any>} streamText Stream text from AI
 */
/**
 * @typedef {import('@nan0web/ui').ModelAsAppOptions & {
 *   ai?: any
 * }} AiModelAsAppOptions
 */
export class AiModelAsApp extends ModelAsApp {
    /**
     * @param {Partial<AiModelAsApp>} [data]
     * @param {Partial<AiModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<AiModelAsApp>, options?: Partial<AiModelAsAppOptions>);
    _: {
        ai: any;
        adapter: import("@nan0web/ui").InputAdapter;
        parentPath: string;
        _isExplicit: boolean;
        db: import("@nan0web/db").default | null | undefined;
        plugins: Record<string, any>;
        t: import("@nan0web/types/src/utils/TFunction").TFunction;
    };
}
/**
 * Contract for the injected AI Engine
 */
export type AIEngineContract = {
    /**
     * The currently selected AI model
     */
    selectedModel: import("../../llm/ModelInfo.js").ModelInfo | null;
    /**
     * Get a model by ID
     */
    getModel: (arg0: string) => import("../../llm/ModelInfo.js").ModelInfo | undefined;
    /**
     * Find a model by partial ID
     */
    findModel: (arg0: string) => import("../../llm/ModelInfo.js").ModelInfo | undefined;
    /**
     * Stream text from AI
     */
    streamText: (arg0: string, arg1: any[], arg2: any | undefined) => import("ai").StreamTextResult<any, any>;
};
export type AiModelAsAppOptions = import("@nan0web/ui").ModelAsAppOptions & {
    ai?: any;
};
import { ModelAsApp } from '@nan0web/ui';
