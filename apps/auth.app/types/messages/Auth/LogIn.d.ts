export class LogInBody {
    static ERRORS: {
        identifierMin: string;
        identifierOnly: string;
        passwordMin: string;
        passwordOnly: string;
    };
    static identifier: {
        minlength: number;
        label: string;
        help: string;
        placeholder: string;
        type: string;
        /** @param {string} identifier @returns {string | true} */
        validation: (identifier: string) => string | true;
    };
    static password: {
        label: string;
        help: string;
        type: string;
        /** @param {string} password @returns {string[] | true} */
        validation: (password: string) => string[] | true;
    };
    /**
     *
     * @param {Partial<LogInBody>} input
     */
    constructor(input?: Partial<LogInBody>);
    /** @type {string} */
    identifier: string;
    /** @type {string} */
    password: string;
    /** @type {boolean} */
    remember: boolean;
}
export default class LogIn extends Message {
    static Body: typeof LogInBody;
    static name: string;
    static help: string;
    static from(input: any): LogIn;
    constructor(input?: {});
    /** @type {LogInBody} */
    body: LogInBody;
    get identifierLabel(): string;
    get passwordLabel(): string;
    get errors(): string[];
}
import Message from '@nan0web/types';
