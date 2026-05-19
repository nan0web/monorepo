export default class SignUpMessage extends ModelInputMessage {
    static alias: string;
    static email: {
        help: string;
        type: string;
        required: boolean;
        default: string;
        validate: (v: any) => true | "Email is required" | "Email is invalid";
    };
    static password: {
        help: string;
        type: string;
        required: boolean;
        default: string;
        validate: (v: any) => any;
    };
    static username: {
        help: string;
        type: string;
        required: boolean;
        default: string;
        validate: (v: any) => any;
    };
    static soulId: {
        help: string;
        type: string;
        required: boolean;
        default: string;
    };
    /** @type {string} */ email: string;
    /** @type {string} */ password: string;
    /** @type {string} */ username: string;
    /** @type {string} */ soulId: string;
    get emailLabel(): string;
    get emailHelp(): any;
    get emailPlaceholder(): string;
    get emailType(): string;
    get passwordLabel(): string;
    get passwordHelp(): any;
    get passwordType(): string;
    get usernameLabel(): string;
    get usernameHelp(): any;
    get usernameMinLength(): number;
}
import ModelInputMessage from './ModelInputMessage.js';
