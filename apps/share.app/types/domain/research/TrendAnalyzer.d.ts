/**
 * TrendAnalyzer
 *
 * Scrapes google trends, youtube trends, and RSS feeds to generate topic digests.
 */
export class TrendAnalyzer {
    /**
     * Fetches search trends from Google.
     * @returns {Promise<Record<string, any>>}
     */
    fetchGoogleTrends(): Promise<Record<string, any>>;
    /**
     * Fetches video trends from YouTube.
     * @returns {Promise<Record<string, any>>}
     */
    fetchYouTubeTrends(): Promise<Record<string, any>>;
    /**
     * Compiles Google, YouTube, and RSS trends into a final digest.
     * @returns {Promise<ResultIntent & { timestamp: string, digest: string[] }>}
     */
    compileDigest(): Promise<ResultIntent & {
        timestamp: string;
        digest: string[];
    }>;
}
import { ResultIntent } from '../Models.js';
