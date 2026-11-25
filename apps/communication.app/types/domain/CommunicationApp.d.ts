/**
 * Subcommand: Register a contact in a 7iOS we/ circle.
 */
export class InitCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        initialized: string;
        bootstrapped: string;
    };
    static author: {
        help: string;
        default: string;
    };
    static circle: {
        help: string;
        default: string;
    };
    static bootstrap: {
        help: string;
        default: boolean;
    };
    static tourDir: {
        help: string;
        default: string;
    };
    static dryRun: {
        help: string;
        default: boolean;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} Contact soulId */ author: string;
    /** @type {string} 7iOS circle */ circle: string;
    /** @type {boolean} Bootstrap Day 1 tree */ bootstrap: boolean;
    /** @type {string} Tour template directory */ tourDir: string;
    /** @type {boolean} Dry run mode */ dryRun: boolean;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * Subcommand: Send a message to a sharded chat repository.
 */
export class SendCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        sent: string;
    };
    static repo: {
        help: string;
        default: string;
    };
    static chatId: {
        help: string;
        default: string;
    };
    static author: {
        help: string;
        default: string;
    };
    static text: {
        help: string;
        default: string;
    };
    static timestamp: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} Explicit repository URI */ repo: string;
    /** @type {string} Chat ID for prefix sharding */ chatId: string;
    /** @type {string} Author soulId */ author: string;
    /** @type {string} Message text */ text: string;
    /** @type {string} ISO timestamp */ timestamp: string;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * Subcommand: View messages for a given date.
 */
export class ViewCommand extends ModelAsApp {
    static alias: string;
    static repo: {
        help: string;
        default: string;
    };
    static chatId: {
        help: string;
        default: string;
    };
    static date: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} Explicit repository URI */ repo: string;
    /** @type {string} Chat ID for prefix sharding */ chatId: string;
    /** @type {string} Date YYYY-MM-DD */ date: string;
    run(): AsyncGenerator<never, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * Subcommand: Crystallize a chat message into a document or todo.md.
 */
export class CrystallizeCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        crystallized: string;
    };
    static msgUri: {
        help: string;
        default: string;
    };
    static targetDocUri: {
        help: string;
        default: string;
    };
    static kind: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} Source message URI */ msgUri: string;
    /** @type {string} Target document URI */ targetDocUri: string;
    /** @type {string} Entry kind */ kind: string;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * Subcommand: Inspect peer branch sync state.
 */
export class SyncCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        synced: string;
    };
    static repo: {
        help: string;
        default: string;
    };
    static chatId: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} Explicit repository URI */ repo: string;
    /** @type {string} Chat ID for prefix sharding */ chatId: string;
    run(): AsyncGenerator<import("@nan0web/ui/src/core/Intent.js").ShowIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
}
/**
 * Main polymorphic OLMUI application controller for @nan0web/communication.app.
 */
export class CommunicationApp extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static command: {
        help: string;
        options: (typeof InitCommand | typeof SendCommand | typeof ViewCommand | typeof CrystallizeCommand | typeof SyncCommand)[];
        positional: boolean;
        default: typeof ViewCommand;
    };
    constructor(data?: {}, options?: {});
    /** @type {ModelAsApp} Active subcommand instance */ command: ModelAsApp;
    /**
     * Delegates execution polymorphically to the active subcommand model.
     * @returns {AsyncGenerator<import('@nan0web/ui').Intent, any, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, any, any>;
}
import { ModelAsApp } from '@nan0web/ui';
