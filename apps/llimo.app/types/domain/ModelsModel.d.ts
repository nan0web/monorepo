/**
 * ModelsModel — Model-as-Schema representation for loading, filtering, and browsing LLM models.
 */
export class ModelsModel extends Model {
    static alias: string;
    static filter: {
        help: string;
        default: string;
    };
    constructor(data?: {}, options?: {});
    /** @type {string} Filter query for model filtering */ filter: string;
    run(): AsyncGenerator<never, {
        status: string;
    }, unknown>;
}
import { Model } from '@nan0web/types';
