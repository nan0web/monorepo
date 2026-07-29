/**
 * @typedef {object} ScriptGenerateCommandOptions
 * @property {string} topic - Topic or idea for the script.
 * @property {string} [style] - Writing style template (storytelling|educational|promotional|hook).
 * @property {string} [language] - Language code (uk|en|auto).
 * @property {string} [output] - Output file path for the script.
 * @property {number} [duration] - Target video duration in seconds (default: 60).
 * @property {string} [platform] - Target platform (youtube|tiktok|instagram|linkedin).
 */
export class ScriptGenerateCommand extends ModelAsApp {
    static alias: string;
    static topic: {
        type: string;
        required: boolean;
        help: string;
    };
    static style: {
        type: string;
        required: boolean;
        help: string;
    };
    static language: {
        type: string;
        required: boolean;
        help: string;
    };
    static output: {
        type: string;
        required: boolean;
        help: string;
    };
    static duration: {
        type: string;
        required: boolean;
        default: number;
        help: string;
    };
    static platform: {
        type: string;
        required: boolean;
        help: string;
    };
    /** Built-in style templates */
    static STYLES: {
        storytelling: {
            name: string;
            instructions: string;
        };
        educational: {
            name: string;
            instructions: string;
        };
        promotional: {
            name: string;
            instructions: string;
        };
        hook: {
            name: string;
            instructions: string;
        };
        article: {
            name: string;
            instructions: string;
        };
    };
    /**
     * @param {string} styleName
     * @returns {string}
     */
    static _resolveStyle(styleName: string): string;
    /**
     * @param {string} platform
     * @returns {string}
     */
    static _platformTip(platform: string): string;
    /**
     * @param {ScriptGenerateCommandOptions} data
     * @param {Partial<import('@nan0web/ui').ModelAsAppOptions>} [options]
     */
    constructor(data?: ScriptGenerateCommandOptions, options?: Partial<import("@nan0web/ui").ModelAsAppOptions>);
    run(): AsyncGenerator<{
        type: string;
        level: string;
        message: string;
    } | {
        type: string;
        message: string;
        level?: undefined;
    }, {
        type: string;
        data: {
            success: boolean;
            script: string;
            style: any;
            language: any;
            platform: any;
            duration: number;
            outputPath: any;
            message?: undefined;
        };
    } | {
        type: string;
        data: {
            success: boolean;
            message: any;
            script?: undefined;
            style?: undefined;
            language?: undefined;
            platform?: undefined;
            duration?: undefined;
            outputPath?: undefined;
        };
    }, unknown>;
}
export type ScriptGenerateCommandOptions = {
    /**
     * - Topic or idea for the script.
     */
    topic: string;
    /**
     * - Writing style template (storytelling|educational|promotional|hook).
     */
    style?: string;
    /**
     * - Language code (uk|en|auto).
     */
    language?: string;
    /**
     * - Output file path for the script.
     */
    output?: string;
    /**
     * - Target video duration in seconds (default: 60).
     */
    duration?: number;
    /**
     * - Target platform (youtube|tiktok|instagram|linkedin).
     */
    platform?: string;
};
import { ModelAsApp } from '@nan0web/ui-cli';
