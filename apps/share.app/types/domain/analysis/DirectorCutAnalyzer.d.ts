export class DirectorCutAnalyzer extends Model {
    static alias: string;
    static sceneAliases: {
        type: string;
        default: {
            код: string;
            чат: string;
            старт: string;
            екран: string;
            презентація: string;
            ліво: string;
            ліва: string;
            left: string;
            право: string;
            права: string;
            right: string;
            центр: string;
            center: string;
        };
        help: string;
    };
    static scenes: {
        type: string;
        default: {};
        help: string;
    };
    static cutSilence: {
        type: string;
        default: boolean;
        help: string;
    };
    static minSilenceDuration: {
        type: string;
        default: number;
        help: string;
    };
    static paddingBefore: {
        type: string;
        default: number;
        help: string;
    };
    static paddingAfter: {
        type: string;
        default: number;
        help: string;
    };
    static totalDuration: {
        type: string;
        help: string;
    };
    /**
     * @param {object} [data]
     * @param {object} [options]
     */
    constructor(data?: object, options?: object);
    /** @type {Record<string, string>} Scene aliases map */
    sceneAliases: Record<string, string>;
    /** @type {Record<string, any>} */
    scenes: Record<string, any>;
    /** @type {boolean} */
    cutSilence: boolean;
    /** @type {number} */
    minSilenceDuration: number;
    /** @type {number} */
    paddingBefore: number;
    /** @type {number} */
    paddingAfter: number;
    /** @type {number|undefined} */
    totalDuration: number | undefined;
    /**
     * Parse Whisper transcript into director scenes.
     * @param {object} transcript - Whisper transcript with segments and optional words.
     * @returns {Array<{ sceneName: string, start: number, end: number, text: string, align?: string, box?: string }>}
     */
    parseScenes(transcript: object): Array<{
        sceneName: string;
        start: number;
        end: number;
        text: string;
        align?: string;
        box?: string;
    }>;
}
import { Model } from '@nan0web/types';
