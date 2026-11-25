/**
 * Computes deterministic 2-level prefix shard URI: chats/<xx>/<yy>/<chatId>.
 * @param {string} chatId
 * @param {string} [base='chats']
 * @returns {string}
 */
export function resolveChatShardUri(chatId: string, base?: string): string;
/**
 * Parses a serialized chat message Markdown document using @nan0web/markdown.
 * @param {string} raw
 * @returns {{ author: string, timestamp: string, text: string }}
 */
export function parseMessageMarkdown(raw: string): {
    author: string;
    timestamp: string;
    text: string;
};
/**
 * 2D Git-native chat repository with time-sharded Markdown messages.
 */
export class ChatRepoModel extends ModelAsApp {
    static UI: {
        errorAuthorTextRequired: string;
    };
    static repo: {
        help: string;
        default: string;
    };
    /**
     * @param {Partial<ChatRepoModel>} [data]
     * @param {Partial<import('@nan0web/types').ModelOptions>} [options]
     */
    constructor(data?: Partial<ChatRepoModel>, options?: Partial<import("@nan0web/types").ModelOptions>);
    /** @type {string} Repository base URI */ repo: string;
    /**
     * Sends and persists a message in chat/YYYY/MM/DD/<ts>-<peer>.md and updates README.md.
     * @param {{ author: string, text: string, timestamp?: string }} input
     * @returns {Promise<{ uri: string, filename: string, author: string, timestamp: string, text: string }>}
     */
    sendMessage(input: {
        author: string;
        text: string;
        timestamp?: string;
    }): Promise<{
        uri: string;
        filename: string;
        author: string;
        timestamp: string;
        text: string;
    }>;
    /**
     * Lists all messages for a given YYYY-MM-DD date in chronological order.
     * @param {string} dateStr
     * @returns {Promise<Array<{ uri: string, filename: string, author: string, timestamp: string, text: string }>>}
     */
    listDay(dateStr: string): Promise<Array<{
        uri: string;
        filename: string;
        author: string;
        timestamp: string;
        text: string;
    }>>;
    #private;
}
import { ModelAsApp } from '@nan0web/ui';
