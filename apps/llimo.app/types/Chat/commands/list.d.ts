/**
 * Options for the `list` command.
 */
export class ListOptions {
    static fix: {
        help: string;
        default: boolean;
    };
    static filter: {
        alias: string;
        help: string;
        default: string;
    };
    constructor(input?: {});
    /** @type {boolean} */
    fix: boolean;
    /** @type {string} */
    filter: string;
    /**
     * @returns {(info: {id: string, msgCount: number, lastActivity: string}) => boolean}
     */
    getFilterPredicate(): (info: {
        id: string;
        msgCount: number;
        lastActivity: string;
    }) => boolean;
}
/**
 * `list` command – lists available chats with basic info.
 */
export class ListCommand extends UiCommand {
    static name: string;
    static description: string;
    static UI: {
        ERROR_DB: string;
    };
    /**
     * @param {Record<string, any>} [input={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     * @returns {ListCommand}
     */
    static create(input?: Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>): ListCommand;
    /**
     * @param {Partial<ListCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<ListCommand> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {ListOptions} */
    options: ListOptions;
    run(): AsyncGenerator<boolean | Alert | Table | import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").AskIntent, void, unknown>;
}
import { UiCommand } from "../../cli/Ui.js";
import { Alert } from "../../cli/components/index.js";
import { Table } from "../../cli/components/index.js";
