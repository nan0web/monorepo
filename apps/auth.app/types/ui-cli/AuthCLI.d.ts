/**
 * CLI UI for authentication using @nan0web/ui-cli
 *
 * Usage:
 * const cli = new AuthCLI({ db });
 * await cli.signup();
 */
export default class AuthCLI {
    constructor({ db, tokenManager, logger, tokenRotationRegistry }: {
        db: any;
        tokenManager: any;
        logger: any;
        tokenRotationRegistry: any;
    });
    db: any;
    app: AuthApp;
    adapter: CLIInputAdapter;
    logger: any;
    commands: {
        signup: {
            title: string;
            fn: (input: SignUpMessage) => AsyncGenerator<OutputMessage, void, unknown>;
        };
        confirm: {
            title: string;
            fn: (input: ConfirmSignUpMessage) => AsyncGenerator<OutputMessage, void, unknown>;
        };
        login: {
            title: string;
            fn: (input: LoginMessage) => AsyncGenerator<OutputMessage, void, unknown>;
        };
        forgot: {
            title: string;
            fn: (input: {
                body: {
                    username: string;
                };
            }) => AsyncGenerator<OutputMessage, void, unknown>;
        };
        reset: {
            title: string;
            fn: (input: {
                body: {
                    username: string;
                    code: string;
                    password: string;
                };
            }) => AsyncGenerator<OutputMessage, void, unknown>;
        };
        info: {
            title: string;
            fn: (input: import("../messages/UpdateInfoMessage.js").default) => AsyncGenerator<OutputMessage, void, unknown>;
        };
        refresh: {
            title: string;
            fn: (input: {
                body: {
                    refreshToken: string;
                };
            }) => AsyncGenerator<OutputMessage, void, unknown>;
        };
    };
    signup(): Promise<{
        success: boolean;
        messages: any[];
        cancelled?: undefined;
    } | {
        cancelled: boolean;
        success?: undefined;
        messages?: undefined;
    }>;
    confirmSignup(): Promise<{
        success: boolean;
        messages: any[];
        cancelled?: undefined;
    } | {
        cancelled: boolean;
        success?: undefined;
        messages?: undefined;
    }>;
    login(): Promise<{
        success: boolean;
        messages: any[];
        cancelled?: undefined;
    } | {
        cancelled: boolean;
        success?: undefined;
        messages?: undefined;
    }>;
    _handleInteractive(MessageClass: any): Promise<{
        success: boolean;
        messages: any[];
        cancelled?: undefined;
    } | {
        cancelled: boolean;
        success?: undefined;
        messages?: undefined;
    }>;
    run(): Promise<void>;
    /**
     * Displays message in terminal
     * @param {OutputMessage} message - Message object with isError, isInfo, isSuccess properties and content array
     * @private
     */
    private _renderMessage;
}
import AuthApp from '../AuthApp.js';
import { CLiInputAdapter as CLIInputAdapter } from '@nan0web/ui-cli';
import { SignUpMessage } from '../messages/index.js';
import { OutputMessage } from '@nan0web/types';
import { ConfirmSignUpMessage } from '../messages/index.js';
import { LoginMessage } from '../messages/index.js';
