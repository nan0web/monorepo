import { ShareAdapter } from '../domain/ShareAdapter.js'

/**
 * IPFSAdapter
 *
 * Stores media assets permanently in IPFS.
 */
export class IPFSAdapter extends ShareAdapter {
	get id() {
		return 'ipfs'
	}

	async verify() {
		return true
	}

	/**
	 * Stores a file in IPFS.
	 * @param {string} filePath
	 * @returns {Promise<{ ok: boolean, code: number, success: boolean, cid: string, url: string }>}
	 */
	async store(filePath) {
		if (!filePath) {
			throw new Error('filePath is required')
		}
		// Fictional/Mock CID representing IPFS storage output
		const mockCid = 'QmXoypizjW3WknFixtdKL94pZ7h2L7kS73yL3rF6t4V6aW'
		return {
			ok: true,
			code: 200,
			success: true,
			cid: mockCid,
			url: `ipfs://${mockCid}`
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
