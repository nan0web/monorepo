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
        initializing: string;
        missingInput: string;
        stepTranscription: string;
        cachedTranscriptFound: string;
        audioDownloadProgress: string;
        audioSegmentProgress: string;
        whisperChunkProgress: string;
        whisperChunkDetail: string;
        whisperChunkDone: string;
        transcriptionSaved: string;
        stepSegmentation: string;
        pausesFound: string;
        episodesGenerated: string;
        stepSlicing: string;
        slicingComplete: string;
        subtitlesGenerated: string;
        overviewCreated: string;
        groundTruthLoaded: string;
        articleGenStart: string;
        articleSaved: string;
        articlesAllDone: string;
        masterLongreadDone: string;
        socialPackagesDone: string;
        llmMetrics: string;
        shortsProgress: string;
        stepPublishing: string;
        auditEmptyWarning: string;
        auditSuccess: string;
        pipelineComplete: string;
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
    static language: {
        type: string;
        required: boolean;
        default: string;
        help: string;
    };
    static minChapterDuration: {
        type: string;
        required: boolean;
        default: number;
        help: string;
    };
    static shorts: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static shortsDuration: {
        type: string;
        required: boolean;
        default: number;
        help: string;
    };
    static subtitles: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static article: {
        type: string;
        required: boolean;
        default: boolean;
        help: string;
    };
    static template: {
        type: string;
        required: boolean;
        default: string;
        help: string;
    };
    static model: {
        type: string;
        required: boolean;
        default: string;
        help: string;
    };
    static sources: {
        type: string;
        required: boolean;
        default: string;
        help: string;
    };
    static overview: {
        type: string;
        required: boolean;
        default: boolean;
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
    run(): AsyncGenerator<string | import("@nan0web/ui/src/core/Intent.js").ShowIntent | import("@nan0web/ui/src/core/Intent.js").ProgressIntent, import("@nan0web/ui/src/core/Intent.js").ResultIntent, unknown>;
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
