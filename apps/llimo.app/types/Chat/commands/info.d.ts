/**
 * `info` command – shows a table with per‑message statistics,
 * cost and model/provider columns.
 */
export class InfoCommand extends UiCommand {
    static name: string;
    static description: string;
    /**
     * @param {object} [input]
     * @param {string[]} [input.argv=[]]
     * @param {Chat} [input.chat]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     * @returns {InfoCommand}
     */
    static create(input?: {
        argv?: string[] | undefined;
        chat?: Chat | undefined;
    }, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>): InfoCommand;
    /**
     * @param {Partial<InfoCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<InfoCommand> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {InfoOptions} */
    options: InfoOptions;
    /** @type {Chat} */
    chat: Chat;
    /** @type {Ui} */
    ui: Ui;
    /** @type {FileSystem} */
    fs: FileSystem;
    /**
     * @throws
     * @returns {AsyncGenerator<UiOutput | boolean>}
     */
    run(): AsyncGenerator<UiOutput | boolean>;
    /**
     * @returns {Promise<Table>}
     */
    info(): Promise<Table>;
}
import { UiCommand } from "../../cli/Ui.js";
/**
 * Options for the `info` command.
 */
declare class InfoOptions {
    static id: {
        help: string;
        default: string;
    };
    constructor(input?: {});
    /** @type {string} */
    id: string;
}
import { Chat } from "../../llm/Chat.js";
import { Ui } from "../../cli/Ui.js";
import { FileSystem } from "../../utils/FileSystem.js";
import { UiOutput } from "../../cli/UiOutput.js";
import { Table } from "../../cli/components/index.js";
export {};
