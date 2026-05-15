/**
 * @todo
 * Conver old @nan0web/{co|ui} API to new @nan0web/{types/ui}.
 * Message, MessageBody -> ModelAsApp
 */
export class InitCommand extends ModelAsApp {
    static version: {
        help: string;
        default: string;
        errorRequired: string;
    };
    static UI: {};
    /**
     * @param {Partial<App>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<App>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {string} Release version */ version: string;
}
export class App extends ModelAsApp {
    static command: {
        help: string;
        options: (typeof InitCommand)[];
        default: null;
    };
    /**
     * @param {Partial<App>} [data]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: Partial<App>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {ModelAsApp} Subcommand to run */ command: ModelAsApp;
}
import { ModelAsApp } from "@nan0web/ui";
