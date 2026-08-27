import { Model } from '@nan0web/types';
/**
 * GalleryModel — OLMUI Model-as-Schema
 * Image gallery / media grid with optional captions.
 */
export declare class GalleryModel extends Model {
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
}
