export class Command {
    static alias: string;
    static mightGroup: boolean;
    /**
     * @param {import("../ChatSessionModel.js").ChatSessionModel} chat
     * @param {import("../ChatSessionModel.js").Attachment} attachment
     */
    constructor(chat: import("../ChatSessionModel.js").ChatSessionModel, attachment: import("../ChatSessionModel.js").Attachment);
    chat: import("../ChatSessionModel.js").ChatSessionModel;
    /** @type {string} */
    name: string;
    /** @type {string} */
    content: string;
    /** @type {number | undefined} */
    startLine: number | undefined;
    /** @type {number | undefined} */
    lineCount: number | undefined;
    /**
     * @throws {Error}
     * @returns {AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>}
     */
    run(): AsyncGenerator<import("@nan0web/ui").Intent, import("@nan0web/ui").ResultIntent, any>;
}
