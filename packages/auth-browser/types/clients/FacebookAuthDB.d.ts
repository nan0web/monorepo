export default FacebookAuthDB;
/**
 * Implements Facebook social authentication for AuthDB
 */
declare class FacebookAuthDB extends AuthDB {
    /**
     * @param {string} accessToken - Facebook access token
     * @returns {Promise<{token: string}>} Server response with authentication token
     */
    auth(accessToken: string): Promise<{
        token: string;
    }>;
}
import AuthDB from '../AuthDB.js';
