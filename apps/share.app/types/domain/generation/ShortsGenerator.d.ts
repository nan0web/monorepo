/**
 * ShortsGenerator
 *
 * Cuts video segments into vertical Shorts and embeds thumbnails.
 */
export class ShortsGenerator {
    /**
     * Splits video into shorts.
     * @param {string} shortsYaml - Path to shorts configuration file
     * @returns {Promise<ResultIntent & { count: number }>}
     */
    split(shortsYaml: string): Promise<ResultIntent & {
        count: number;
    }>;
    /**
     * Embeds a thumbnail image in the last second of a vertical video.
     * @param {string} videoPath - Video file path
     * @param {string} imgPath - Image file path
     * @returns {Promise<ResultIntent & { outputPath: string }>}
     */
    embedThumbnail(videoPath: string, imgPath: string): Promise<ResultIntent & {
        outputPath: string;
    }>;
}
import { ResultIntent } from '../Models.js';
