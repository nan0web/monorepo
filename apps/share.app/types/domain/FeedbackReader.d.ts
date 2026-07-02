/**
 * Asynchronous feedback reader stream generator.
 */
export class FeedbackReader extends Model {
    static postId: {
        help: string;
        default: string;
    };
    static intervalMs: {
        help: string;
        default: number;
    };
    /**
     * @param {Partial<FeedbackReader> | Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Partial<FeedbackReader> | Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {boolean} */
    isStopped: boolean;
    /** @type {Set<string>} Cache of processed comment IDs */
    seenIds: Set<string>;
    /** @type {string} Target post ID */ postId: string;
    /** @type {number} Polling interval */ intervalMs: number;
    /**
     * Asynchronous generator streaming new feedback comments.
     * @yields {import('./Models.js').SocialAdapterFeedback}
     */
    run(): AsyncGenerator<any, void, unknown>;
    stop(): void;
}
import { Model } from './Models.js';
