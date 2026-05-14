export default HardwareAuthDB;
/**
 * Hardware key auth provider for AuthDB
 */
declare class HardwareAuthDB extends AuthDB {
    /**
     * @param {string} keyId
     * @param {string} challenge
     * @returns {Promise<{token: string}>}
     */
    auth(keyId: string, challenge: string): Promise<{
        token: string;
    }>;
}
import AuthDB from '../AuthDB.js';
