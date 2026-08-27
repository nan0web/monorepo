import { Model } from '@nan0web/types';
/**
 * Universal Article model with text/markdown content.
 */
export declare class Article extends Model {
    static $collection: string;
    static title: {
        help: string;
        type: string;
        required: boolean;
        localized: boolean;
    };
    static slug: {
        help: string;
        type: string;
        required: boolean;
        unique: boolean;
    };
    static content: {
        help: string;
        type: string;
        localized: boolean;
    };
}
