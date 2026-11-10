/**
 * Media
 *
 * Sovereign Media asset artifact.
 * Clean model with zero presentation/placement concerns,
 * while maintaining backward compatibility for legacy properties.
 *
 * @class Media
 * @extends Model
 */
export default class Media extends Model {
    static id: {
        type: string;
        help: string;
    };
    static url: {
        type: string;
        help: string;
    };
    static mime: {
        type: string;
        help: string;
        default: string;
    };
    static type: {
        type: string;
        help: string;
        default: string;
    };
    static caption: {
        type: string;
        help: string;
        default: string;
    };
    static filesize: {
        type: string;
        help: string;
        default: number;
    };
    static dimensions: {
        type: string;
        help: string;
        default: {};
    };
    static placement: {
        type: string;
        help: string;
    };
    /**
     * @param {Record<string, any>} [data]
     * @param {import('@nan0web/types').ModelOptions} [options]
     */
    constructor(data?: Record<string, any>, options?: import("@nan0web/types").ModelOptions);
    /** @type {string} Unique media identifier (e.g. photo-1) */ id: string;
    /** @type {string} File path, IPFS hash or HTTP URL */ url: string;
    /** @type {string} Caption or alt text */ caption: string;
    /** @type {number} Size in bytes */ filesize: number;
    /** @type {{ width?: number, height?: number }} Media dimensions { width, height } */
    dimensions: {
        width?: number;
        height?: number;
    };
    /** @type {Record<string, any>|undefined} Legacy placement directive */
    placement: Record<string, any> | undefined;
    /** @type {string} MIME type of file (e.g. image/jpeg, video/mp4) */ mime: string;
    set type(val: string);
    /**
     * Category derived from MIME type (image, video, audio, etc.) or legacy type.
     *
     * @returns {string}
     */
    get type(): string;
}
import { Model } from '@nan0web/types';
