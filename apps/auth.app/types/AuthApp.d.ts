/**
 * AuthApp - Authentication system core, integrated with existing infrastructure
 *
 * This agnostic core can work in Web, CLI, API, and test environments.
 * It uses your existing AuthDB, TokenManager, etc. classes without HTTP dependency.
 */
export default class AuthApp extends Model {
    /**
     * @param {AuthConfig|Object} [data] - System configuration (Data)
     * @param {any} [options] - Infrastructure and Models (Register)
     */
    constructor(data?: AuthConfig | any, options?: any);
    /** @returns {any} */
    get _(): any;
    /** @returns {import('@nan0web/log').Logger} */
    get logger(): import("@nan0web/log").Logger;
    /**
     * Main pipeline dispatcher.
     * Routes the incoming message to the corresponding method (e.g., SignUpMessage -> signUp).
     * @param {any} msg - Incoming message
     * @yields {OutputMessage}
     */
    run(msg: any): AsyncGenerator<any, void, any>;
    /**
     * Initializes the core and registers actions
     */
    init(): Promise<void>;
    /**
     * Registers a new user using existing classes
     * @param {SignUpMessage} input - Sign up message with email, username and password
     * @yields {OutputMessage} Registration result messages
     */
    signUp(input: SignUpMessage): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * Confirms registration using existing services
     * @param {ConfirmSignUpMessage} input - Confirmation message with contact and code
     * @yields {OutputMessage} Confirmation result messages
     */
    confirmSignUp(input: ConfirmSignUpMessage): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * User login
     * @param {LoginMessage} input - Login message with identifier and password
     * @yields {OutputMessage} Login result messages
     */
    login(input: LoginMessage): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * Forgot password - sends reset code
     * @param {{ body: { username: string } }} input - Input with username
     * @yields {OutputMessage} Forgot password result message
     */
    forgotPassword(input: {
        body: {
            username: string;
        };
    }): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * Reset password with code
     * @param {{ body: { username: string, code: string, password: string } }} input - Input with username, code and new password
     * @yields {OutputMessage} Reset password result messages
     */
    resetPassword(input: {
        body: {
            username: string;
            code: string;
            password: string;
        };
    }): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * Updates user information
     * @param {UpdateInfoMessage} input - Update info message with user data and authorization header
     * @yields {OutputMessage} Update info result message
     */
    updateInfo(input: UpdateInfoMessage): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * Authenticates user by token
     * @param {string} token - Authorization token
     * @returns {Promise<Object|null>} User object or null if authentication fails
     */
    authenticate(token: string): Promise<any | null>;
    /**
     * Hashes a value (as in AuthServer)
     * @param {string} value - Value to hash
     * @returns {string} Short hash of the value
     */
    getShortHash(value: string): string;
    /**
     * Refreshes user access token
     * @param {{ body: { refreshToken: string } }} input - Input with refresh token
     * @yields {OutputMessage} Refresh token result messages
     */
    refreshToken(input: {
        body: {
            refreshToken: string;
        };
    }): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * Links a sovereign Soul ID to an existing user account.
     * @param {{ body: { username: string, soulId: string } }} input
     * @yields {OutputMessage} Link result
     */
    linkSoulId(input: {
        body: {
            username: string;
            soulId: string;
        };
    }): AsyncGenerator<OutputMessage, void, unknown>;
    /**
     * Registers a new user with community membership.
     * @param {Object} input - SignUpMessage + soulId + membership config
     * @yields {OutputMessage} Registration result
     */
    registerForCommunity(input: any): AsyncGenerator<OutputMessage, void, unknown>;
    #private;
}
import { Model } from '@nan0web/types';
import { SignUpMessage } from './messages/index.js';
import { OutputMessage } from '@nan0web/types';
import { ConfirmSignUpMessage } from './messages/index.js';
import { LoginMessage } from './messages/index.js';
import { UpdateInfoMessage } from './messages/index.js';
import { AuthConfig } from './index.js';
