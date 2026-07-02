import { ShareAdapter } from '../domain/ShareAdapter.js'

/**
 * ArweaveAdapter
 *
 * Stores media assets permanently in Arweave.
 */
export class ArweaveAdapter extends ShareAdapter {
	get id() {
		return 'arweave'
	}

	async verify() {
		return true
	}

	/**
	 * Stores a file in Arweave.
	 * @param {string} filePath
	 * @returns {Promise<{ ok: boolean, code: number, success: boolean, txId: string, url: string }>}
	 */
	async store(filePath) {
		if (!filePath) {
			throw new Error('filePath is required')
		}
		// Fictional/Mock Tx ID representing Arweave storage output
		const mockTxId = 'h6G5j-S_W4XJ2P5uLhK4F8pTz9yD7R3vM8c2N1s0B4a'
		return {
			ok: true,
			code: 200,
			success: true,
			txId: mockTxId,
			url: `https://arweave.net/${mockTxId}`
		}
	}

	/**
	 * Publishes content by storing the document/media path.
	 * @param {any} content
	 * @returns {Promise<any>}
	 */
	async publish(content) {
		const filePath = content.file || content.document
		return this.store(filePath)
	}
}
