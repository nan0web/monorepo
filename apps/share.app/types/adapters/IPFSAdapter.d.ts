/**
 * IPFSAdapter
 *
 * Stores media assets permanently in IPFS.
 */
export class IPFSAdapter extends ShareAdapter {
    /**
     * Stores a file in IPFS.
     * @param {string} filePath
     * @returns {Promise<{ ok: boolean, code: number, success: boolean, cid: string, url: string }>}
     */
    store(filePath: string): Promise<{
        ok: boolean;
        code: number;
        success: boolean;
        cid: string;
        url: string;
    }>;
}
import { ShareAdapter } from '../domain/ShareAdapter.js';
