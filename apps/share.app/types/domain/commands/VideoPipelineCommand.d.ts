/**
 * @typedef {object} VideoPipelineOptions
 * @property {string} [url] - Source video URL (YouTube, TikTok, etc.) or local file.
 * @property {string} [cutMap] - Optional path to pre-existing cut-map.yaml.
 * @property {string} [outputDir='tmp/pipeline'] - Directory for intermediate and output assets.
 * @property {string} [publish] - Comma-separated platforms to publish to (e.g., 'youtube,telegram').
 * @property {boolean} [dryRun=false] - If true, execute without calling external mutating APIs.
 */
/**
 * Master pipeline orchestrator for video ingestion, transcript analysis, pause-based cut-map generation, slicing, and multi-platform publishing.
 */
export class VideoPipelineCommand extends ModelAsApp {
    static alias: string;
    static UI: {
        title: string;
    };
    static url: {
        type: string;
        required: boolean;
        help: string;
    };
    static cutMap: {
        type: string;
        required: boolean;
        help: string;
    };
    static outputDir: {
        type: string;
        required: boolean;
        default: string;
        help: string;
    };
    static publish: {
        type: string;
        required: boolean;
        help: string;
    };
    static dryRun: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    /**
     * @param {VideoPipelineOptions} [data]
     * @param {object} [options]
     */
    constructor(data?: VideoPipelineOptions, options?: object);
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
            error: string;
            outputDir?: undefined;
            url?: undefined;
            published?: undefined;
        };
    } | {
        type: string;
        data: {
            success: boolean;
            outputDir: string;
            url: any;
            published: boolean;
            error?: undefined;
        };
    }, unknown>;
}
export type VideoPipelineOptions = {
    /**
     * - Source video URL (YouTube, TikTok, etc.) or local file.
     */
    url?: string;
    /**
     * - Optional path to pre-existing cut-map.yaml.
     */
    cutMap?: string;
    /**
     * - Directory for intermediate and output assets.
     */
    outputDir?: string;
    /**
     * - Comma-separated platforms to publish to (e.g., 'youtube,telegram').
     */
    publish?: string;
    /**
     * - If true, execute without calling external mutating APIs.
     */
    dryRun?: boolean;
};
import { ModelAsApp } from '@nan0web/ui-cli';
