export default class SignUpMessage extends InputMessage {
    /** @type {Object} */
    static name: any;
    static from(input: any): SignUpMessage;
    constructor(input?: {});
    body: {
        email: string;
        password: string;
        username: string;
    };
    get errors(): (string | (string | {
        min: number;
    })[])[];
    get emailLabel(): string;
    get emailHelp(): string;
    get emailPlaceholder(): string;
    get emailType(): string;
    get passwordLabel(): string;
    get passwordHelp(): string;
    get passwordType(): string;
    get usernameLabel(): string;
    get usernameHelp(): string;
    get usernameMinLength(): number;
}
import { InputMessage } from '@nan0web/types';
