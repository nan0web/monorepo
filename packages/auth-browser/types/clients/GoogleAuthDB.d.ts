export default GoogleAuthDB;
/**
 * Google auth provider for AuthDB
 */
declare class GoogleAuthDB extends AuthDB {
    /**
     * @param {string} token
     * @returns {Promise<{token: string}>}
     */
    auth(token: string): Promise<{
        token: string;
    }>;
}
import AuthDB from '../AuthDB.js';
