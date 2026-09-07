/**
 * CommentModel — OLMUI Model-as-Schema
 * Base model for user-generated comments / reviews.
 */
export class CommentModel extends Model {
    static $id: string;
    static author: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static avatar: {
        help: string;
        placeholder: string;
        default: string;
    };
    static text: {
        help: string;
        placeholder: string;
        default: string;
        required: boolean;
    };
    static date: {
        help: string;
        placeholder: string;
        default: string;
    };
    /**
     * @param {Partial<CommentModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options (db, etc.)
     */
    constructor(data?: Partial<CommentModel> | Record<string, any>, options?: object);
    /** @type {string} Author name */ author: string;
    /** @type {string} Author avatar image URL */ avatar: string;
    /** @type {string} Comment body text */ text: string;
    /** @type {string} Comment date (ISO 8601) */ date: string;
}
import { Model } from '@nan0web/types';
