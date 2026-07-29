/**
 * @typedef {object} PublishCommandOptions
 * @property {string} videoPath - Path to the video file to publish.
 * @property {string} title - Title for the publication.
 * @property {string} description - Description for the publication.
 * @property {string[]} [platforms] - Array of platforms to publish to (e.g., ['youtube']).
 * @property {string} [tags] - Comma-separated tags for SEO.
 * @property {string} [credentials] - Path to credentials file (YAML/nan0, default: credentials.yaml).
 * @property {string} [language] - Content language code (uk, en).
 */
export class PublishCommand extends ModelAsApp {
    static alias: string;
    static videoPath: {
        type: string;
        required: boolean;
        help: string;
    };
    static title: {
        type: string;
        required: boolean;
        help: string;
    };
    static description: {
        type: string;
        required: boolean;
        help: string;
    };
    static platforms: {
        type: string;
        required: boolean;
        multiple: boolean;
        help: string;
    };
    static tags: {
        type: string;
        required: boolean;
        help: string;
    };
    static credentials: {
        type: string;
        required: boolean;
        help: string;
    };
    static language: {
        type: string;
        required: boolean;
        help: string;
    };
    /** Map platform names to adapter classes */
    static ADAPTER_MAP: {
        youtube: typeof YouTubeAdapter;
        telegram: typeof TelegramAdapter;
        medium: typeof MediumAdapter;
        dummy: typeof DummyAdapter;
    };
    /**
     * @param {PublishCommandOptions} data
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: PublishCommandOptions, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    run(): AsyncGenerator<{
        type: string;
        message: string;
        level?: undefined;
    } | {
        type: string;
        level: string;
        message: string;
    }, {
        type: string;
        data: {
            success: boolean;
            results: ({
                platform: any;
                success: boolean;
                id: any;
                url: any;
                error?: undefined;
            } | {
                platform: any;
                success: boolean;
                error: any;
                id?: undefined;
                url?: undefined;
            })[];
            message: string;
        };
    }, unknown>;
}
export type PublishCommandOptions = {
    /**
     * - Path to the video file to publish.
     */
    videoPath: string;
    /**
     * - Title for the publication.
     */
    title: string;
    /**
     * - Description for the publication.
     */
    description: string;
    /**
     * - Array of platforms to publish to (e.g., ['youtube']).
     */
    platforms?: string[];
    /**
     * - Comma-separated tags for SEO.
     */
    tags?: string;
    /**
     * - Path to credentials file (YAML/nan0, default: credentials.yaml).
     */
    credentials?: string;
    /**
     * - Content language code (uk, en).
     */
    language?: string;
};
import { ModelAsApp } from '@nan0web/ui-cli';
import { YouTubeAdapter } from '../../adapters/YouTubeAdapter.js';
import { TelegramAdapter } from '../../adapters/TelegramAdapter.js';
import { MediumAdapter } from '../../adapters/MediumAdapter.js';
import { DummyAdapter } from '../DummyAdapter.js';
