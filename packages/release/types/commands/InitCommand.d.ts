export default class InitCommand extends Command {
    static name: string;
    static help: string;
    static Body: typeof InitBody;
    /** @param {Partial<Command> & { body?: Partial<InitBody> }} [input={}] */
    constructor(input?: Partial<Command> & {
        body?: Partial<InitBody>;
    });
    body: InitBody;
    run(): AsyncGenerator<OutputMessage, void, unknown>;
}
import Command from './Command.js';
declare class InitBody {
    static version: {
        help: string;
        defaultValue: string;
    };
    constructor({ version }?: {
        version?: string | undefined;
    });
    /** @type {string} */
    version: string;
}
import { OutputMessage } from '@nan0web/co';
export {};
