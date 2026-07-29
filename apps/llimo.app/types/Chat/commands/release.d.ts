/**
 * @typedef {"pending" | "waiting" | "working" | "complete" | "fail"} TaskStatus
 */
/**
 * @typedef {{ label: string, link: string, text: string }} Task
 */
/**
 * Options for the `release` command.
 */
export class ReleaseOptions {
    static release: {
        alias: string;
        help: string;
        default: string;
    };
    static threads: {
        alias: string;
        help: string;
        default: number;
    };
    static attempts: {
        alias: string;
        help: string;
        default: number;
    };
    static docker: {
        alias: string;
        help: string;
        default: boolean;
    };
    static temp: {
        help: string;
        default: string;
    };
    static dry: {
        alias: string;
        help: string;
        default: boolean;
    };
    static delay: {
        help: string;
        default: number;
    };
    constructor(input?: {});
    /** @type {string} */
    release: string;
    /** @type {number} */
    threads: number;
    /** @type {number} */
    attempts: number;
    /** @type {boolean} */
    docker: boolean;
    /** @type {string} */
    temp: string;
    /** @type {boolean} */
    dry: boolean;
    /** @type {number} */
    delay: number;
}
/**
 * `release` command – processes release tasks from NOTES.md in parallel using git worktrees.
 */
export class ReleaseCommand extends UiCommand {
    static STAGE_DETAILS: {
        key: string;
        label: string;
    }[];
    static STAGE_LABELS: {};
    static name: string;
    static description: string;
    /**
     * @param {object} [input]
     * @param {string[]} [input.argv=[]]
     * @param {Chat} [input.chat]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     * @returns {ReleaseCommand}
     */
    static create(input?: {
        argv?: string[] | undefined;
        chat?: Chat | undefined;
    }, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>): ReleaseCommand;
    /**
     * @param {Partial<ReleaseCommand> | Record<string, any>} [data={}]
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options={}]
     */
    constructor(data?: Partial<ReleaseCommand> | Record<string, any>, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    /** @type {ReleaseOptions} */
    options: ReleaseOptions;
    /** @type {FileSystem} */
    fs: FileSystem;
    /** @type {Chat} */
    chat: Chat;
    /** @type {Task[]} */
    tasks: Task[];
    /** @type {string} */
    releaseDir: string;
    /**
     * @param {object} [options]
     * @param {(payload: { task: any, chunk: any }) => void} [options.onData]
     * @param {(ms?: number) => Promise<void>} [options.pause]
     * @returns {AsyncGenerator<Alert | boolean>}
     * @throws
     */
    run(options?: {
        onData?: ((payload: {
            task: any;
            chunk: any;
        }) => void) | undefined;
        pause?: ((ms?: number) => Promise<void>) | undefined;
    }): AsyncGenerator<Alert | boolean>;
    /**
     * @param {Task} task
     * @param {object} options
     * @param {ReleaseProtocol} options.release
     * @param {(chunk: any) => void} [options.onData]
     * @param {(ms?: number) => Promise<void>} [options.pause]
     * @returns {Promise<{ status: TaskStatus, attempts: number }>}
     */
    processTask(task: Task, options: {
        release: ReleaseProtocol;
        onData?: ((chunk: any) => void) | undefined;
        pause?: ((ms?: number) => Promise<void>) | undefined;
    }): Promise<{
        status: TaskStatus;
        attempts: number;
    }>;
    /**
     * Execute bash command in cwd.
     * @param {string} command
     * @param {string[]} [args=[]]
     * @param {object} [options]
     * @param {string} [options.cwd=this.fs.cwd]
     * @param {(chunk: any) => void} [options.onData]
     */
    exec(command: string, args?: string[], options?: {
        cwd?: string | undefined;
        onData?: ((chunk: any) => void) | undefined;
    }): Promise<any>;
}
export type TaskStatus = "pending" | "waiting" | "working" | "complete" | "fail";
export type Task = {
    label: string;
    link: string;
    text: string;
};
import { UiCommand } from "../../cli/Ui.js";
import { FileSystem } from "../../utils/FileSystem.js";
import { Chat } from "../../llm/Chat.js";
import { Alert } from "../../cli/components/index.js";
import { ReleaseProtocol } from "../../utils/Release.js";
