/**
 * GalleryModel — OLMUI Model-as-Schema
 * Image gallery / media grid with optional captions.
 */
export class GalleryModel extends Model {
    static $id: string;
    static title: {
        help: string;
        placeholder: string;
        default: string;
    };
    static items: {
        help: string;
        type: string;
        default: never[];
    };
    static columns: {
        help: string;
        default: number;
        type: string;
    };
    /**
     * @param {Partial<GalleryModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<GalleryModel> | Record<string, any>, options?: object);
    /** @type {string} Gallery section title */ title: string;
    /** @type {Array<{src: string, caption?: string, alt?: string}>} Gallery items */ items: Array<{
        src: string;
        caption?: string;
        alt?: string;
    }>;
    /** @type {number} Number of columns in grid layout */ columns: number;
}
import { Model } from '@nan0web/types';
