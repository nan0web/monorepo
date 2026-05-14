export default class PublishCommand extends Command {
    static name: string;
    static help: string;
    static Body: typeof PublishBody;
    /** @param {Partial<Command> & { body?: Partial<PublishBody> }} [input={}] */
    constructor(input?: Partial<Command> & {
        body?: Partial<PublishBody>;
    });
    /** @type {PublishBody} */
    body: PublishBody;
}
import Command from './Command.js';
declare class PublishBody {
    static major: {
        help: string;
        defaultValue: boolean;
    };
    static minor: {
        help: string;
        defaultValue: boolean;
    };
    static patch: {
        help: string;
        defaultValue: boolean;
    };
    constructor({ major, minor, patch }?: {
        major?: boolean | undefined;
        minor?: boolean | undefined;
        patch?: boolean | undefined;
    });
    /** @type {boolean} */
    major: boolean;
    /** @type {boolean} */
    minor: boolean;
    /** @type {boolean} */
    patch: boolean;
}
export {};
