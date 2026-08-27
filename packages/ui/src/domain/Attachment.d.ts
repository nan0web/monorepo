import { Model } from '@nan0web/types';
/**
 * Universal Attachment model for uploaded files and documents.
 */
export declare class Attachment extends Model {
    static $collection: string;
    static $upload: boolean;
    static title: {
        help: string;
        type: string;
        localized: boolean;
    };
    static url: {
        help: string;
        type: string;
        required: boolean;
    };
    static filename: {
        help: string;
        type: string;
        required: boolean;
    };
    static mimeType: {
        help: string;
        type: string;
        required: boolean;
    };
    static filesize: {
        help: string;
        type: string;
    };
    static alt: {
        help: string;
        type: string;
        localized: boolean;
    };
}
