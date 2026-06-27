export class Command {
	static alias = ''
	static mightGroup = false

	/**
	 * @param {import("../ChatSessionModel.js").ChatSessionModel} chat
	 * @param {import("../ChatSessionModel.js").Attachment} attachment
	 */
	constructor(chat, attachment) {
		this.chat = chat
		/** @type {string} */
		this.name = attachment.filename
		/** @type {string} */
		this.content = attachment.content
		/** @type {number | undefined} */
		this.startLine = attachment.startLine
		/** @type {number | undefined} */
		this.lineCount = attachment.lineCount
	}

	/**
	 * @throws {Error}
	 * @returns {AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>}
	 */
	async *run() {
		throw new Error('Not implemented')
	}
}
