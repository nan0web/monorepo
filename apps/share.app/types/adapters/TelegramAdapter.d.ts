export class TelegramAdapterConfig extends SocialAdapterConfig {
    static botToken: {
        help: string;
        default: any;
    };
    static chatId: {
        help: string;
        default: any;
    };
    static parseMode: {
        help: string;
        default: "HTML" | "MarkdownV2";
    };
    static disableNotification: {
        help: string;
        default: boolean;
    };
    /**
     * @param {{ botToken: string, chatId: string, parseMode?: 'HTML'|'MarkdownV2', disableNotification?: boolean } & Partial<import('../domain/Models.js').SocialAdapterConfig>} raw
     */
    constructor(raw?: {
        botToken: string;
        chatId: string;
        parseMode?: "HTML" | "MarkdownV2";
        disableNotification?: boolean;
    } & Partial<import("../domain/Models.js").SocialAdapterConfig>);
    /** @type {string} */
    botToken: string;
    /** @type {string} */
    chatId: string;
    /** @type {'HTML'|'MarkdownV2'} */
    parseMode: "HTML" | "MarkdownV2";
    /** @type {boolean} */
    disableNotification: boolean;
}
/**
 * @nan0web/share-telegram
 *
 * Sovereign Telegram Adapter for share.app and connect.app.
 * Uses the Telegram Bot API to publish content and aggregate feedback.
 */
export class TelegramAdapter extends SocialAdapter {
    /**
     * @param {ConstructorParameters<typeof TelegramAdapterConfig>[0]} config
     */
    constructor(config?: ConstructorParameters<typeof TelegramAdapterConfig>[0]);
    /** @type {TelegramAdapterConfig} */
    config: TelegramAdapterConfig;
    get capabilities(): string[];
    /**
     * Low-level HTTP caller for the Telegram Bot API.
     * Extracted for easy mocking in tests.
     * @param {string} method - Telegram API method name
     * @param {Record<string, any>} body - JSON body
     * @returns {Promise<Record<string, any>>}
     */
    _callApi(method: string, body: Record<string, any>): Promise<Record<string, any>>;
    /**
     * @param {import('../domain/Models.js').SocialAdapterContent} content
     * @returns {Promise<import('../core/Models.js').SocialAdapterPublishResult>}
     */
    publish(content: import("../domain/Models.js").SocialAdapterContent): Promise<any>;
    delete(postId: any): Promise<boolean>;
    syncFeedback(postId: any): Promise<any[]>;
    #private;
}
import { SocialAdapterConfig } from '../domain/Models.js';
import { SocialAdapter } from '../domain/SocialAdapter.js';
