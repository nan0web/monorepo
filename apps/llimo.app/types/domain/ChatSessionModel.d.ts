/**
 * Contract for the injected AI Engine
 * @typedef {Object} AIEngineContract
 * @property {import('@nan0web/llimo/src/llm/ModelInfo.js').default | null} selectedModel The currently selected AI model
 * @property {function(string): import('@nan0web/llimo/src/llm/ModelInfo.js').default | undefined} getModel Get a model by ID
 * @property {function(string): import('@nan0web/llimo/src/llm/ModelInfo.js').default | undefined} findModel Find a model by partial ID
 * @property {function(string, any[], any=): import('ai').StreamTextResult<any>} streamText Stream text from AI
 */
/**
 * Model-as-Schema for tracking metadata of an active LLiMo Engine execution or chat
 */
export class ChatSessionModel extends Model {
    static id: {
        help: string;
        default: null;
        type: string;
    };
    static date: {
        help: string;
        default: null;
        type: string;
    };
    static input: {
        help: string;
        default: string;
        type: string;
        positional: boolean;
    };
    static model: {
        help: string;
        default: string;
        type: string;
    };
    static logsPath: {
        help: string;
        default: string;
        type: string;
    };
    static status: {
        help: string;
        default: string;
        type: string;
        validate: (val: any) => string | true;
    };
    static UI: {
        welcome: string;
        thinking: string;
        streaming: string;
        processing: string;
        err_status: string;
    };
    /**
     * @param {Partial<ChatSessionModel> | Record<string, any>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions> & { ai?: AIEngineContract }} [options]
     */
    constructor(data?: Partial<ChatSessionModel> | Record<string, any>, options?: Partial<import("@nan0web/types").ModelOptions> & {
        ai?: AIEngineContract;
    });
    /** @type {AIEngineContract | undefined} AI Provider instance */ ai: AIEngineContract | undefined;
    /** @type {string} Unique identifier for the chat session */ id: string;
    /** @type {string} Date string formatted as YYYY-MM-DD for grouping logs */ date: string;
    /** @type {string} Initial input prompt or path to file */ input: string;
    /** @type {string} AI model to use for the session */ model: string;
    /** @type {string} Absolute path to the directory hosting the chat artifacts (.csv, .log, .md) */ logsPath: string;
    /** @type {string} Current status of the execution: active, ok, failed */ status: string;
    /**
     * Main execution loop for the Chat session
     */
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * Contract for the injected AI Engine
 */
export type AIEngineContract = {
    /**
     * The currently selected AI model
     */
    selectedModel: import("@nan0web/llimo/src/llm/ModelInfo.js").default | null;
    /**
     * Get a model by ID
     */
    getModel: (arg0: string) => import("@nan0web/llimo/src/llm/ModelInfo.js").default | undefined;
    /**
     * Find a model by partial ID
     */
    findModel: (arg0: string) => import("@nan0web/llimo/src/llm/ModelInfo.js").default | undefined;
    /**
     * Stream text from AI
     */
    streamText: (arg0: string, arg1: any[], arg2: any | undefined) => import("ai").StreamTextResult<any, any>;
};
import { Model } from '@nan0web/types';
