import { Model } from '@nan0web/types';
/**
 * MarkdownModel — OLMUI Model-as-Schema
 * Represents a rich text block powered by Markdown.
 */
export declare class MarkdownModel extends Model {
    static $id: string;
    static content: {
        help: string;
        type: string;
        default: string;
    };
    /**
     * @param {Partial<MarkdownModel> | Record<string, any>} data Model input data.
     * @param {object} [options] Extended options
     */
    constructor(data?: Partial<MarkdownModel> | Record<string, any>, options?: object);
}
