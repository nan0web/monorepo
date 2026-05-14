export default class StatusCommand extends Command {
    static name: string;
    static help: string;
    constructor(input?: {});
    body: {};
    run(): AsyncGenerator<OutputMessage, void, unknown>;
}
import Command from './Command.js';
import { OutputMessage } from '@nan0web/co';
