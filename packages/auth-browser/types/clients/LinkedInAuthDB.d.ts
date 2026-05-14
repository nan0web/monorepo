export default LinkedInAuthDB;
/**
 * LinkedIn auth provider for AuthDB
 */
declare class LinkedInAuthDB extends AuthDB {
    /**
     * @param {string} token
     * @returns {Promise<{token: string}>}
     */
    auth(token: string): Promise<{
        token: string;
    }>;
}
import AuthDB from '../AuthDB.js';
