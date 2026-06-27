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
    /**
     * Load strategy from database
     * @param {any} db
     * @returns {Promise<AiStrategyModel>}
     */
    static loadFromDb(db: any): Promise<AiStrategyModel>;
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
     * Save strategy configuration to database
     * @param {any} db
     * @returns {Promise<void>}
     */
    saveToDb(db: any): Promise<void>;
    /**
     * Get serializable payload for persistence.
     * @returns {Record<string, any>}
     */
    toPayload(): Record<string, any>;
}
/**
 * StrategyListModel — Read-only display of current strategy.
 */
export class StrategyListModel extends ModelAsApp {
    static alias: string;
    constructor(data?: {}, options?: {});
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * StrategyAddModel — Add a model to the cascade queue.
 */
export class StrategyAddModel extends ModelAsApp {
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
export class StrategyRemoveModel extends ModelAsApp {
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
 * StrategyEditModel — Interactive editing of the full strategy.
 */
export class StrategyEditModel extends ModelAsApp {
    static alias: string;
    constructor(data?: {}, options?: {});
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * StrategyApp — Nested app for strategy subcommands.
 */
export class StrategyApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static command: {
        help: string;
        options: (typeof StrategyEditModel)[];
        positional: boolean;
        default: typeof StrategyListModel;
    };
    constructor(data?: {}, options?: {});
    /** @type {any} */ command: any;
    run(): AsyncGenerator<any, any, any>;
}
import { ModelAsApp } from '@nan0web/ui';
