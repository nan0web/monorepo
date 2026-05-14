export default class SpecCommand extends Command {
    static name: string;
    static help: string;
    static Body: typeof SpecBody;
    /** @param {Partial<Command> & { body?: Partial<SpecBody> }} [input={}] */
    constructor(input?: Partial<Command> & {
        body?: Partial<SpecBody>;
    });
    body: SpecBody;
    run(): AsyncGenerator<OutputMessage, void, unknown>;
}
import Command from './Command.js';
declare class SpecBody {
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
