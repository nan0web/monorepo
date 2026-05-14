export default class CloseCommand extends Command {
    static name: string;
    static help: string;
    static Body: typeof CloseBody;
    /** @param {Partial<Command> & { body?: Partial<CloseBody> }} [input={}] */
    constructor(input?: Partial<Command> & {
        body?: Partial<CloseBody>;
    });
    body: CloseBody;
    run(): AsyncGenerator<OutputMessage, void, unknown>;
}
import Command from './Command.js';
declare class CloseBody {
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
