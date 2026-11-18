/**
 * Step 1: Intent (I) — goal and acceptance criteria (<= 7).
 */
export class IntentStep extends Model {
    static maxCriteria: {
        help: string;
        default: number;
    };
    static releaseDir: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<IntentStep>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<IntentStep>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {number} Maximum number of acceptance criteria per task (<= 7) */
    maxCriteria: number;
    /** @type {string} Directory pattern for release artifacts */
    releaseDir: string;
}
/**
 * Step 2: Knowledge (K) — MCP-first research & targetFiles whitelist.
 */
export class KnowledgeStep extends Model {
    static preferMcp: {
        help: string;
        default: boolean;
    };
    static requireTargetFiles: {
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<KnowledgeStep>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<KnowledgeStep>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {boolean} Prefer active MCP servers before grep/read_file */
    preferMcp: boolean;
    /** @type {boolean} Require explicit targetFiles whitelist before code changes */
    requireTargetFiles: boolean;
}
/**
 * Step 3: Model (M) — pure Model-as-Schema / ModelAsApp domain design.
 */
export class ModelStep extends Model {
    static pureDomain: {
        help: string;
        default: boolean;
    };
    static dbMount: {
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<ModelStep>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<ModelStep>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {boolean} Enforce pure domain models without OS/UI coupling */
    pureDomain: boolean;
    /** @type {boolean} Use virtual DB mounts (this.$db) for all I/O */
    dbMount: boolean;
}
/**
 * Step 4: Contract (C) — TDD contract tests on In-Memory @nan0web/db.
 */
export class ContractStep extends Model {
    static inMemoryDb: {
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<ContractStep>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<ContractStep>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {boolean} Run scenario/contract tests against In-Memory @nan0web/db */
    inMemoryDb: boolean;
}
/**
 * Step 5: Build (B) — minimal clean implementation.
 */
export class BuildStep extends Model {
    static forbidDirectFs: {
        help: string;
        default: boolean;
    };
    static forbidDbExtensions: {
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<BuildStep>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<BuildStep>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {boolean} Forbid direct fs/path/os/process usage in domain code */
    forbidDirectFs: boolean;
    /** @type {boolean} Forbid explicit file extensions in saveDocument/loadDocument */
    forbidDbExtensions: boolean;
}
/**
 * Step 6: Inspect (V) — automated verification & scope isolation.
 */
export class InspectStep extends Model {
    static runTests: {
        help: string;
        default: boolean;
    };
    static runInspect: {
        help: string;
        default: boolean;
    };
    static checkScope: {
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<InspectStep>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<InspectStep>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {boolean} Run test:all before completion */
    runTests: boolean;
    /** @type {boolean} Run nan0inspect domain audit before completion */
    runInspect: boolean;
    /** @type {boolean} Verify git diff stays within declared targetFiles */
    checkScope: boolean;
}
/**
 * Step 7: Sync (S) — release cycle, knowledge index & backlog sync.
 */
export class SyncStep extends Model {
    static updateIndex: {
        help: string;
        default: boolean;
    };
    static updateBacklog: {
        help: string;
        default: boolean;
    };
    /**
     * @param {Partial<SyncStep>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<SyncStep>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {boolean} Update nan0web-knowledge index (pnpm run ai:index) */
    updateIndex: boolean;
    /** @type {boolean} Record discovered gaps in releases/backlog.md */
    updateBacklog: boolean;
}
/**
 * 7-step CoCoDev configuration container.
 */
export default class StepsConfig extends Model {
    static intent: {
        help: string;
        type: string;
        hint: typeof IntentStep;
        default: {};
    };
    static knowledge: {
        help: string;
        type: string;
        hint: typeof KnowledgeStep;
        default: {};
    };
    static model: {
        help: string;
        type: string;
        hint: typeof ModelStep;
        default: {};
    };
    static contract: {
        help: string;
        type: string;
        hint: typeof ContractStep;
        default: {};
    };
    static build: {
        help: string;
        type: string;
        hint: typeof BuildStep;
        default: {};
    };
    static inspect: {
        help: string;
        type: string;
        hint: typeof InspectStep;
        default: {};
    };
    static sync: {
        help: string;
        type: string;
        hint: typeof SyncStep;
        default: {};
    };
    /**
     * @param {Partial<StepsConfig>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<StepsConfig>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {IntentStep} Step 1: Intent (I) */
    intent: IntentStep;
    /** @type {KnowledgeStep} Step 2: Knowledge (K) */
    knowledge: KnowledgeStep;
    /** @type {ModelStep} Step 3: Model (M) */
    model: ModelStep;
    /** @type {ContractStep} Step 4: Contract (C) */
    contract: ContractStep;
    /** @type {BuildStep} Step 5: Build (B) */
    build: BuildStep;
    /** @type {InspectStep} Step 6: Inspect (V) */
    inspect: InspectStep;
    /** @type {SyncStep} Step 7: Sync (S) */
    sync: SyncStep;
}
import { Model } from '@nan0web/types';
