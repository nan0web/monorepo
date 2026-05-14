/**
 * UserApp requires user name and shows Welcome view.
 * If user.name is provided in command input, ignores user input.
 * User can change user data to see another Welcome view.
 */
export default class UserApp extends CoreApp {
    /**
     * Creates a new UserApp instance.
     * @param {Partial<CoreApp>} [props={}] - UserApp properties
     */
    constructor(props?: Partial<CoreApp>);
    /**
     * Handle deps command with async generator for stream processing.
     * @param {DepsCommand} cmd - Command message with deps parameters
     * @param {UserUI} ui - UI instance
     * @returns {Promise<Object>} Command output
     */
    handleDeps(cmd: DepsCommand, ui: UserUI): Promise<any>;
    /**
     * Set user data from params.
     * @param {UserAppCommandMessage} cmd - Command message with user data
     * @param {UserUI} ui - UI instance
     * @returns {Promise<{ message: string }>} Welcome message
     */
    setUser(cmd: UserAppCommandMessage, ui: UserUI): Promise<{
        message: string;
    }>;
    /**
     * Show welcome message for current user.
     * @param {UserAppCommandMessage} cmd - Command message
     * @param {UserUI} ui - UI instance
     * @returns {Promise<string[][]>} Welcome view output
     */
    welcome(cmd: UserAppCommandMessage, ui: UserUI): Promise<string[][]>;
    user: User | undefined;
}
import CoreApp from '../Core/CoreApp.js';
import DepsCommand from './Command/Message.js';
import UserUI from './UserUI.js';
import UserAppCommandMessage from './Command/Message.js';
import User from '../../Model/User/User.js';
