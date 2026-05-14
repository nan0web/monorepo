export default class DepsCommand extends Command {
    static name: string;
    static help: string;
    static Body: typeof DepsBody;
    /** @param {Partial<DepsBody>} [input={}] */
    constructor(input?: Partial<DepsBody>);
    /** @type {DepsBody} */
    body: DepsBody;
    /**
     * @param {DepsCommand} [msg]
     * @returns {AsyncGenerator<OutputMessage>}
     */
    run(msg?: DepsCommand): AsyncGenerator<OutputMessage>;
}
import Command from './Command.js';
declare class DepsBody {
    static fix: {
        help: string;
        defaultValue: boolean;
    };
    static latest: {
        help: string;
        defaultValue: boolean;
    };
    constructor(input?: {});
    /** @type {boolean} */
    fix: boolean;
    /** @type {boolean} */
    latest: boolean;
}
import { OutputMessage } from '@nan0web/co';
export {};
