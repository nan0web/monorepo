/**
 * ArweaveAdapter
 *
 * Stores media assets permanently in Arweave.
 */
export class ArweaveAdapter extends ShareAdapter {
    /**
     * Stores a file in Arweave.
     * @param {string} filePath
     * @returns {Promise<{ ok: boolean, code: number, success: boolean, txId: string, url: string }>}
     */
    store(filePath: string): Promise<{
        ok: boolean;
        code: number;
        success: boolean;
        txId: string;
        url: string;
    }>;
}
import { ShareAdapter } from '../domain/ShareAdapter.js';
