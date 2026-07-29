/**
 * AiStrategyModel — Model-as-Schema representing cascade, budgeting, failover options, and timeouts for LLiMo execution.
 *
 * @property {string[]} cascadeQueue Priority target queue of models to attempt.
 * @property {number} budgetLimitUsd Hard cost limit for this execution.
 * @property {number} timeoutMs Target model response timeout limit.
 * @property {number} failoverLimit Maximum cascade failovers allowed.
 * @property {number} retryCount Immediate transient error retry attempts before fallback.
 * @property {string[]} fallbackCodes Error codes triggering next fallback in cascade.
 * @property {number} concurrencyLimit Max number of parallel subagents.
 * @property {string} cachingMode Cache resolution strategy.
 */
export class AiStrategyModel extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
        loaded: string;
        loadedGlobal: string;
        saved: string;
        noChanges: string;
        currentQueue: string;
        added: string;
        removed: string;
        notFound: string;
        moved: string;
        invalidPosition: string;
    };
    static cascadeQueue: {
        help: string;
        default: string[];
        type: string;
        hint: string;
        selectHint: string;
        columns: {
            key: string;
            label: string;
        }[];
    };
    static budgetLimitUsd: {
        help: string;
        default: number;
        type: string;
    };
    static timeoutMs: {
        help: string;
        default: number;
        type: string;
    };
    static failoverLimit: {
        help: string;
        default: number;
        type: string;
    };
    static failbackCodes: {
        help: string;
        default: string[];
        type: string;
    };
    static retryCount: {
        help: string;
        default: number;
        type: string;
    };
    static fallbackCodes: {
        help: string;
        default: string[];
        type: string;
    };
    static concurrencyLimit: {
        help: string;
        default: number;
        type: string;
    };
    static cachingMode: {
        help: string;
        default: string;
        type: string;
    };
    static command: {
        help: string;
        options: never[];
        positional: boolean;
    };
    /**
     * Load strategy from local .agent/strategy.nan0 or fall back to global defaults.
     * @param {FileSystem} [fs]
     * @returns {Promise<{strategy: AiStrategyModel, source: string}>}
     */
    static loadFromProject(fs?: FileSystem): Promise<{
        strategy: AiStrategyModel;
        source: string;
    }>;
    /**
     * Load template from .nan0 file
     * @param {string} path
     * @param {FileSystem} fs
     * @returns {Promise<AiStrategyModel>}
     */
    static loadTemplate(path: string, fs: FileSystem): Promise<AiStrategyModel>;
    constructor(data?: {}, options?: {});
    cascadeQueue: any[];
    budgetLimitUsd: number;
    timeoutMs: number;
    failoverLimit: number;
    retryCount: number;
    fallbackCodes: any;
    concurrencyLimit: number;
    cachingMode: any;
    /**
     * Save strategy to local .agent/strategy.nan0.
     * @param {FileSystem} [fs]
     * @returns {Promise<void>}
     */
    saveToProject(fs?: FileSystem): Promise<void>;
    /**
     * Get serializable payload for persistence.
     * @returns {Record<string, any>}
     */
    toPayload(): Record<string, any>;
    /**
     * Save strategy configuration as .nan0 template
     * @param {string} path
     * @param {FileSystem} fs
     * @returns {Promise<void>}
     */
    saveTemplate(path: string, fs: FileSystem): Promise<void>;
}
/**
 * StrategyListModel — Read-only display of current strategy.
 */
export class StrategyListModel extends Model {
    static alias: string;
    constructor(data?: {}, options?: {});
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * StrategyAddModel — Add a model to the cascade queue.
 */
export class StrategyAddModel extends Model {
    static alias: string;
    static model: {
        help: string;
        default: string;
        positional: boolean;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ model: string;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * StrategyRemoveModel — Remove a model from the cascade queue.
 */
export class StrategyRemoveModel extends Model {
    static alias: string;
    static model: {
        help: string;
        default: string;
        positional: boolean;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ model: string;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * StrategyMoveModel — Move a model to a different position in the cascade queue.
 */
export class StrategyMoveModel extends Model {
    static alias: string;
    static model: {
        help: string;
        default: string;
        positional: boolean;
    };
    static position: {
        help: string;
        default: number;
        type: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} */ model: string;
    /** @type {number} */ position: number;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * StrategyEditModel — Interactive editing of the full strategy (default subcommand).
 */
export class StrategyEditModel extends Model {
    static alias: string;
    constructor(data?: {}, options?: {});
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
import { ModelAsApp } from '@nan0web/ui';
import { FileSystem } from '../utils/FileSystem.js';
import { Model } from '@nan0web/types';
