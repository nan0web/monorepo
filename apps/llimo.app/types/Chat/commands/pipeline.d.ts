export class PipelineCommand extends UiCommand {
    static name: string;
    static help: string;
    /**
     * @param {{ argv?: string[], chat?: import('../../llm/Chat.js').Chat }} [input]
     * @returns {PipelineCommand}
     */
    static create(input?: {
        argv?: string[];
        chat?: import("../../llm/Chat.js").Chat;
    }): PipelineCommand;
    constructor(data?: {});
    /** @type {PipelineOptions} */
    options: PipelineOptions;
    /** @type {FileSystem} */
    fs: FileSystem;
    /** @type {AI} */
    ai: AI;
    run(): AsyncGenerator<any, void, unknown>;
    #private;
}
import { UiCommand } from '../../cli/Ui.js';
declare class PipelineOptions {
    static step: {
        help: string;
        default: string;
        options: string[];
    };
    static intent: {
        help: string;
        default: string;
        positional: boolean;
    };
    static task: {
        help: string;
        default: string;
    };
    constructor(input?: {});
    /** @type {string} */
    step: string;
    /** @type {string} */
    intent: string;
    /** @type {string} */
    task: string;
}
import { FileSystem } from '../../utils/FileSystem.js';
import { AI } from '../../llm/AI.js';
export {};
